/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// module: ModuleBase<unknown, unknown>
import { moduleRegistry } from '../modules/registry';
import type { RunContext } from '../util/runContext';
import { extractAllTemplates, IfTemplate, objectContainsTemplates, resolveTemplates } from '../util/tpl';
import { postChecksContextResultKey, TaskSchema, TaskTestMockSchema } from './task.schema';
import type { TaskInterface, TaskTestMockInterface } from './task.schema.gen';
import traverse from 'traverse';
import { maskSensitiveValue } from '../util/logger';
import type {
  AbstractModuleBaseInstance,
  ModuleRunResult,
  ModuleRunResultBaseType,
} from '../modules/abstractModuleBase';
import { joiAttemptRequired, joiKeepOnlyKeysInJoiSchema, joiKeepOnlyKeysNotInJoiObjectDiff } from '../util/joi';
import { tryOrThrowAsync } from '../util/try';
import type { VarsInterface } from './varsContainer.schema.gen';
import { getErrorPrintfClass } from '../util/error';
import { ModuleFail } from '../modules/fail';
import { ModuleFailFullSchema } from '../modules/fail/schema';
import { ModuleExit } from '../modules/exit';
import { ModuleExitFullSchema } from '../modules/exit/schema';
import { TestMock } from './testingCommon';
import { TestMockBaseSchema } from './testingCommon.schema';
import type { DataSourceContext } from '../dataSources/abstractDataSource';
import { findAsync } from '../util/findAsync';
import { lookupTaskFailureHint } from './taskFailures';

export interface TaskRunResult<ResultType extends ModuleRunResultBaseType> {
  moduleRunResult?: ModuleRunResult<ResultType>;
  skipped: boolean;
  exit?: boolean;
  out?: string;
  outRaw?: string;
  global?: boolean;
}

export interface TaskRunTasksInContextResult {
  changed: boolean;
  exit?: boolean;
  vars: VarsInterface;
}

export const TaskErrorFailedWithIfCondition = getErrorPrintfClass(
  'TaskErrorFailedWithIfCondition',
  'Task failed because of failedIf condition: %s'
);

export const TaskErrorFailedWithExecutionError = getErrorPrintfClass(
  'TaskErrorFailedWithBadResult',
  'Task failed because of execution error: %s'
);

export class TaskTestMock extends TestMock {
  constructor(config: TaskTestMockInterface) {
    config = joiAttemptRequired(config, TaskTestMockSchema);
    super(joiKeepOnlyKeysInJoiSchema(config, TestMockBaseSchema), config.if);
  }

  matchesModule(context: DataSourceContext, module: AbstractModuleBaseInstance): Promise<boolean> {
    return super.matchesModuleConfig(context, module);
  }
}

export class Task {
  config: TaskInterface;
  templated: boolean;

  ifTemplate?: IfTemplate;
  failedIfTemplate?: IfTemplate;
  exitIfTemplate?: IfTemplate;
  #testMocks: TaskTestMock[] = [];

  constructor(taskConfig: TaskInterface) {
    this.config = extractAllTemplates(taskConfig);
    this.templated = objectContainsTemplates(this.config);
  }

  #evaluateConfig(config: TaskInterface) {
    if (config.if) {
      this.ifTemplate = new IfTemplate(config.if);
    }

    if (config.failedIf != null) {
      switch (typeof config.failedIf) {
        case 'boolean':
          this.failedIfTemplate = new IfTemplate(`${config.failedIf}`);
          break;
        default:
          this.failedIfTemplate = new IfTemplate(
            typeof config.failedIf == 'string' ? config.failedIf : config.failedIf.if
          );
      }
    }

    if (config.exitIf != null) {
      switch (typeof config.exitIf) {
        case 'boolean':
          this.exitIfTemplate = new IfTemplate(`${config.exitIf}`);
          break;
        default:
          this.exitIfTemplate = new IfTemplate(typeof config.exitIf == 'string' ? config.exitIf : config.exitIf.if);
      }
    }

    if (config.testMocks) {
      this.#testMocks = config.testMocks.map((mockConfig) => new TaskTestMock(mockConfig));
    }
  }

  getConfigForArchive(): TaskInterface {
    // Strip out unnecessary items
    const cleanedConfig: TaskInterface = { ...joiKeepOnlyKeysNotInJoiObjectDiff(this.config, TaskSchema, TaskSchema) };
    return cleanedConfig;
  }

  #resolvedModule?: AbstractModuleBaseInstance;
  get resolvedModule() {
    return this.#resolvedModule;
  }

  async run(context: RunContext): Promise<TaskRunResult<ModuleRunResultBaseType>> {
    let taskConfig = this.config;

    context = context.withVars({
      // Add forcefully defined vars
      ...taskConfig.vars,
    });
    context.logger.debug('Initializing task');

    if (this.templated) {
      await tryOrThrowAsync(async () => {
        taskConfig = await resolveTemplates(this.config, context.varsForTemplate);
      }, 'Failed to initialize task config while resolving templates');
    }

    const module = moduleRegistry.getRegistryEntryInstanceFromIndexedConfig<AbstractModuleBaseInstance>(
      taskConfig,
      TaskSchema
    );
    this.#resolvedModule = module;

    let label: string | undefined;
    if (taskConfig.label) {
      label = `T:${taskConfig.label}`;
    } else if (module.label) {
      label = `M:${module.registryEntry.entryName}:${module.label}`;
    } else {
      label = `M:${module.registryEntry.entryName}`;
    }

    // NOTE: very important to run this because it resolves all conditions/templates/mocks
    this.#evaluateConfig(taskConfig);

    context = context.withLabel(label).prependTestMocks(this.#testMocks);

    if (this.ifTemplate && !(await this.ifTemplate.isTrue(context.vars))) {
      context.logger.info('Task skipped');
      return { skipped: true };
    }

    /*
     * Evaluate testMocks
     * if (context.isTesting && !taskConfig.ignoreMocks) {
     *   if (taskConfig.mock) {
     *     // The single mock will always be matched as the first mock
     *     const mockConfig: TestMockInterface = {
     *       result: taskConfig.mock.result,
     *       changed: taskConfig.mock.changed,
     *       [module.registryEntry.entryName]: 'true',
     *     };
     *     const testMock = new RecipeTestMock(mockConfig);
     *     context = context.prependTestMocks([testMock]);
     *   } else {
     *     const testMocks = (taskConfig.testMocks ?? []).map((mockConfig) => new RecipeTestMock(mockConfig));
     *     context = context.prependTestMocks(testMocks);
     *   }
     * }
     */

    context.logger.debug('Task running');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: ModuleRunResult<any>;
    let mock: TestMock | undefined;
    if (
      context.isTesting &&
      !taskConfig.ignoreMocks &&
      (mock = await findAsync(context.testMocks, (mock) => mock.matchesModule(context, module))) != null
    ) {
      result = mock.getResult();
    } else {
      result = await module.run(context);
    }

    if (taskConfig.sensitive && result.vars) {
      traverse(result.vars).forEach(function (val) {
        if (this.isLeaf && typeof val == 'string') {
          maskSensitiveValue(val);
        }
      });
    }

    const postRunChecksContext = context.withVars({
      [postChecksContextResultKey]: result,
    });

    if (this.failedIfTemplate != null || this.exitIfTemplate != null) {
      context.logger.info(
        `Task executed (pre ${[
          ...(this.failedIfTemplate != null ? ['failedIf'] : []),
          ...(this.exitIfTemplate != null ? ['exitIf'] : []),
        ].join('/')})`,
        {
          result,
        }
      );
    }

    if (this.failedIfTemplate) {
      if (await this.failedIfTemplate.isTrue(postRunChecksContext.varsForTemplate)) {
        const failedIfConfigResolved = await resolveTemplates(
          this.config.failedIf,
          postRunChecksContext.varsForTemplate
        );
        const failResult = await new ModuleFail(
          typeof failedIfConfigResolved == 'string'
            ? 'failedIf condition was true'
            : joiKeepOnlyKeysInJoiSchema(failedIfConfigResolved, ModuleFailFullSchema)
        ).run(postRunChecksContext);
        postRunChecksContext.logger.error('Task failed (failedIf condition)', {
          result,
        });
        throw new TaskErrorFailedWithIfCondition(failResult.failed);
      } else {
        result.failed = undefined;
      }
    } else if (result.failed != undefined) {
      context.logger.error('Task failed', {
        result,
      });
      throw new TaskErrorFailedWithExecutionError(result.failed);
    }

    let forceExit = false;
    if (this.exitIfTemplate) {
      if (await this.exitIfTemplate.isTrue(postRunChecksContext.varsForTemplate)) {
        const exitIfConfigResolved = await resolveTemplates(this.config.exitIf, postRunChecksContext.varsForTemplate);
        const exitResult = await new ModuleExit(
          typeof exitIfConfigResolved == 'string'
            ? 'exitIf condition was true'
            : joiKeepOnlyKeysInJoiSchema(exitIfConfigResolved, ModuleExitFullSchema)
        ).run(postRunChecksContext);
        forceExit = exitResult.exit == true;

        result.vars ??= {};
        Object.assign(result.vars, exitResult.vars);
      }
    }

    context.logger.info('Task completed', {
      result,
      forceExit,
    });

    return {
      moduleRunResult: result,
      exit: forceExit || result.exit,
      skipped: false,
      out: taskConfig.out,
      outRaw: taskConfig.outRaw,
      global: taskConfig.global,
    };
  }

  static async runTasksInContext(context: RunContext, tasks: Task[]): Promise<TaskRunTasksInContextResult> {
    context.statistics.totalTasksCount += tasks.length;

    let changed = false;
    const accumulatedVars: VarsInterface = {};

    for (let i = 0; i < tasks.length; i++) {
      context.vars['__previousTaskResult'] = context.previousTaskResult;

      const task = tasks[i];
      const taskResult = await tryOrThrowAsync(
        async () => await task.run(context),
        (err) => {
          const hint = lookupTaskFailureHint(err);
          const hintSuffix = hint ? '\n\n' + hint : '';
          const taskLabel = [
            ...(task.config.label ? ['"' + task.config.label + '"'] : []),
            ...(task.resolvedModule ? ['[' + task.resolvedModule.registryEntry.entryName + ']'] : []),
          ].join(' ');
          return `Failed to run task${taskLabel != '' ? ' ' + taskLabel : ''} with index ${i}` + hintSuffix;
        }
      );

      context.statistics.processedTasksCount++;

      if (taskResult.skipped) {
        context.statistics.skippedTasksCount++;
      }

      const resultVars = taskResult.moduleRunResult?.vars;
      if (resultVars) {
        if (taskResult.out) {
          accumulatedVars[taskResult.out] = resultVars;
          context.vars[taskResult.out] = resultVars;
        }

        if (taskResult.global) {
          Object.assign(accumulatedVars, resultVars);
          Object.assign(context.vars, resultVars);
        }
      }

      if (task.config.keepPreviousTaskResult != true) {
        context.previousTaskResult = resultVars;
      }

      if (taskResult.outRaw) {
        accumulatedVars[taskResult.outRaw] = taskResult.moduleRunResult;
        context.vars[taskResult.outRaw] = taskResult.moduleRunResult;
      }

      if (taskResult.moduleRunResult?.changed) {
        changed = true;
      }

      if (taskResult.exit) {
        return {
          exit: true,
          changed,
          vars: accumulatedVars,
        };
      }
    }

    return {
      changed,
      vars: accumulatedVars,
    };
  }
}
