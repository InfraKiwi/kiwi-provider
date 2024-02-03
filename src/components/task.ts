/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// module: ModuleBase<unknown, unknown>
import { moduleRegistry } from '../modules/registry';
import type { RunContext } from '../util/runContext';
import {
  extractAllTemplates,
  IfTemplate,
  joiMetaDelayTemplatesResolutionKey,
  objectContainsTemplates,
  resolveTemplates,
  resolveTemplatesWithJoiSchema,
} from '../util/tpl';
import {
  postChecksContextResultKey,
  taskPreviousTaskResultContextKey,
  TaskSchema,
  TaskTestMockSchema,
} from './task.schema';
import type {
  TaskInterface,
  TaskRunTasksInContextResultInterface,
  TaskSingleOrArrayInterface,
  TaskTestMockInterface,
} from './task.schema.gen';
import traverse from 'traverse';
import { maskSensitiveValue } from '../util/logger';
import type {
  AbstractModuleBaseInstance,
  ModuleRunResult,
  ModuleRunResultBaseType,
} from '../modules/abstractModuleBase';
import {
  joiAttemptRequired,
  joiFindMetaValuePaths,
  joiKeepOnlyKeysInJoiSchema,
  joiKeepOnlyKeysNotInJoiObjectDiff,
} from '../util/joi';
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
import { getArrayFromSingleOrArray } from '../util/array';
import { omit } from '../util/object';

export interface TaskRunResult<ResultType extends ModuleRunResultBaseType> {
  moduleRunResult?: ModuleRunResult<ResultType>;
  skipped: boolean;
  out?: string;
  outRaw?: string;
  global?: boolean;
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
        case 'string':
          this.failedIfTemplate = new IfTemplate(`${config.failedIf}`);
          break;
        default:
          this.failedIfTemplate = new IfTemplate(`${config.failedIf.if}`);
      }
    }

    if (config.exitIf != null) {
      switch (typeof config.exitIf) {
        case 'boolean':
        case 'string':
          this.exitIfTemplate = new IfTemplate(`${config.exitIf}`);
          break;
        default:
          this.exitIfTemplate = new IfTemplate(`${config.exitIf.if}`);
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

    const registryEntry = moduleRegistry.findRegistryEntryFromIndexedConfig(taskConfig, TaskSchema, {
      skipConfigValidation: true,
    });
    taskConfig = omit(taskConfig, [registryEntry.entryName]);
    let moduleConfig = this.config[registryEntry.entryName];

    if (this.templated) {
      const vars = context.varsForTemplate;

      try {
        /*
         * We split the configs this way because we're using the joi schema to find templates
         * that should NOT be resolved
         */
        moduleConfig = await resolveTemplatesWithJoiSchema(moduleConfig, vars, registryEntry.schema);
      } catch (ex) {
        context.logger.error(`Failed to resolve templates for module config`, {
          ex,
          moduleConfig,
          vars,
          skipPaths: joiFindMetaValuePaths(
            registryEntry.schema.describe(),
            joiMetaDelayTemplatesResolutionKey,
            true,
            true
          ),
        });
        throw new Error('Failed to resolve templates for module config', { cause: ex });
      }

      try {
        taskConfig = await resolveTemplates(taskConfig, vars);
      } catch (ex) {
        context.logger.error(`Failed to resolve templates for task config`, {
          ex,
          taskConfig,
          vars,
        });
        throw new Error('Failed to resolve templates for task config', { cause: ex });
      }
    }

    const module = new registryEntry.clazz(moduleConfig);

    this.#resolvedModule = module;

    let name: string | undefined;
    if (taskConfig.name) {
      name = `T:${taskConfig.name}`;
    } else if (module.label) {
      name = `M:${module.registryEntry.entryName}:${module.label}`;
    } else {
      name = `M:${module.registryEntry.entryName}`;
    }

    // NOTE: very important to run this because it resolves all conditions/templates/mocks
    this.#evaluateConfig(taskConfig);

    context = context.withName(name).prependTestMocks(this.#testMocks);

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
          typeof failedIfConfigResolved == 'string' || failedIfConfigResolved === true
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

    if (this.exitIfTemplate) {
      if (await this.exitIfTemplate.isTrue(postRunChecksContext.varsForTemplate)) {
        const exitIfConfigResolved = await resolveTemplates(this.config.exitIf, postRunChecksContext.varsForTemplate);
        const exitResult = await new ModuleExit(
          typeof exitIfConfigResolved == 'string' || exitIfConfigResolved === true
            ? 'exitIf condition was true'
            : joiKeepOnlyKeysInJoiSchema(exitIfConfigResolved, ModuleExitFullSchema)
        ).run(postRunChecksContext);
        result.exit = exitResult.exit;

        result.vars ??= {};
        Object.assign(result.vars, exitResult.vars);
      }
    }

    context.logger.info('Task completed', {
      config: context.isTesting ? module.config : undefined,
      mock: mock != null,
      result,
    });

    return {
      moduleRunResult: result,
      skipped: false,
      out: taskConfig.out,
      outRaw: taskConfig.outRaw,
      global: taskConfig.global,
    };
  }

  static async runTasksInContext(context: RunContext, tasks: Task[]): Promise<TaskRunTasksInContextResultInterface> {
    context.statistics.totalTasksCount += tasks.length;

    let changed = false;
    const accumulatedVars: VarsInterface = {};

    for (let i = 0; i < tasks.length; i++) {
      context.vars[taskPreviousTaskResultContextKey] = context.previousTaskResult;

      const task = tasks[i];
      const taskResult = await tryOrThrowAsync(
        async () => await task.run(context),
        (err) => {
          const hint = lookupTaskFailureHint(err);
          const hintSuffix = hint ? '\n\n' + hint : '';
          const taskLabel = [
            ...(task.config.name ? ['"' + task.config.name + '"'] : []),
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
        context.previousTaskResult = taskResult.moduleRunResult;
      }

      if (taskResult.outRaw) {
        accumulatedVars[taskResult.outRaw] = taskResult.moduleRunResult;
        context.vars[taskResult.outRaw] = taskResult.moduleRunResult;
      }

      if (taskResult.moduleRunResult?.changed) {
        changed = true;
      }

      if (taskResult.moduleRunResult?.exit) {
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

  static getTasksFromSingleOrArraySchema(val: TaskSingleOrArrayInterface): Task[] {
    return [...getArrayFromSingleOrArray(val).map((t) => new Task(t))];
  }
}
