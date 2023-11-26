// module: ModuleBase<unknown, unknown>
import { moduleRegistry } from '../modules/registry';
import type { RunContext } from '../util/runContext';
import { newDebug } from '../util/debug';
import { extractAllTemplates, IfTemplate, objectContainsTemplates, resolveTemplates } from '../util/tpl';
import { TaskForArchiveSchema, TaskSchema } from './task.schema';
import type { TaskForArchiveInterface, TaskInterface } from './task.schema.gen';
import traverse from 'traverse';
import { maskSensitiveValue } from '../util/logger';
import { RecipeTestMock } from './recipeTestMock';
import type { TestMockInterface } from './testing.schema.gen';
import type {
  AbstractModuleBaseInstance,
  ModuleRunResult,
  ModuleRunResultBaseType,
} from '../modules/abstractModuleBase';
import { keepOnlyKeysInJoiSchema, keepOnlyKeysNotInJoiObjectDiff } from '../util/joi';
import { tryOrThrowAsync } from '../util/try';
import type { VarsInterface } from './varsContainer.schema.gen';
import { getErrorPrintfClass } from '../util/error';
import { ModuleFail } from '../modules/fail';
import { ModuleFailFullSchema } from '../modules/fail/schema';
import { ModuleExit } from '../modules/exit';
import { ModuleExitFullSchema } from '../modules/exit/schema';

const debug = newDebug(__filename);

export interface TaskRunResult<ResultType extends ModuleRunResultBaseType> {
  moduleRunResult?: ModuleRunResult<ResultType>;
  skipped: boolean;
  exit?: boolean;
  out?: string;
}

export interface TaskRunTasksInContextResult {
  changed: boolean;
  exit?: boolean;
  accumulatedVars: VarsInterface;
}

export const TaskErrorFailedWithIfCondition = getErrorPrintfClass(
  'TaskErrorFailedWithIfCondition',
  `Task failed because of failIf condition: %s`,
);

export const TaskErrorFailedWithExecutionError = getErrorPrintfClass(
  'TaskErrorFailedWithBadResult',
  `Task failed because of execution error: %s`,
);

export class Task {
  config: TaskInterface;
  templated: boolean;

  ifTemplate?: IfTemplate;
  failIfTemplate?: IfTemplate;
  exitIfTemplate?: IfTemplate;

  constructor(taskConfig: TaskInterface) {
    this.config = extractAllTemplates(taskConfig);
    this.templated = objectContainsTemplates(this.config);
  }

  #evaluateConfig(config: TaskInterface) {
    if (config.if) {
      this.ifTemplate = new IfTemplate(config.if);
    }
    if (typeof config.failIf == 'string' || config.failIf?.if) {
      this.failIfTemplate = new IfTemplate(typeof config.failIf == 'string' ? config.failIf : config.failIf.if);
    }
    if (typeof config.exitIf == 'string' || config.exitIf?.if) {
      this.exitIfTemplate = new IfTemplate(typeof config.exitIf == 'string' ? config.exitIf : config.exitIf.if);
    }
  }

  getConfigForArchive(): TaskForArchiveInterface {
    // Strip out unnecessary items
    const cleanedConfig: TaskForArchiveInterface = {
      ...keepOnlyKeysNotInJoiObjectDiff(this.config, TaskForArchiveSchema, TaskSchema),
    };
    return cleanedConfig;
  }

  async run(context: RunContext): Promise<TaskRunResult<ModuleRunResultBaseType>> {
    let taskConfig = this.config;

    context = context.withVars({
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
      TaskSchema,
    );

    let label: string | undefined;
    if (taskConfig.label) {
      label = `T:${taskConfig.label}`;
    } else if (module.label) {
      label = `M:${module.registryEntry.entryName}:${module.label}`;
    } else {
      label = `M:${module.registryEntry.entryName}`;
    }

    context = context.withLabel(label);

    this.#evaluateConfig(taskConfig);
    if (this.ifTemplate && !(await this.ifTemplate.isTrue(context.vars))) {
      context.logger.info('Task skipped');
      return {
        skipped: true,
      };
    }

    // Evaluate mocks
    if (context.isTesting && !taskConfig.ignoreMocks) {
      if (taskConfig.mock) {
        // The single mock will always be matched as the first mock
        const mockConfig: TestMockInterface = {
          result: taskConfig.mock.result,
          changed: taskConfig.mock.changed,
          [module.registryEntry.entryName]: 'true',
        };
        const testMock = new RecipeTestMock(mockConfig);
        context = context.prependTestMocks([testMock]);
      } else {
        const mocks = (taskConfig.mocks ?? []).map((mockConfig) => new RecipeTestMock(mockConfig));
        context = context.prependTestMocks(mocks);
      }
    }

    context.logger.debug(`Task running`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: ModuleRunResult<any>;
    let mock: RecipeTestMock | undefined;
    // TODO support tpl in mocks
    if (
      context.isTesting &&
      !taskConfig.ignoreMocks &&
      (mock = context.testMocks.find((mock) => mock.matches(context, module))) != null
    ) {
      result = mock.getResult();
    } else {
      if (context.isTesting && !taskConfig.ignoreMocks && module.requiresMock) {
        throw new Error(
          `The module ${module.registryEntry.entryName} REQUIRES a mock to be tested. If you want to bypass this protection, use the \`ignoreMocks: true\` option`,
        );
      }
      result = await module.run(context);
    }

    if (taskConfig.sensitive && result.vars) {
      traverse(result.vars).forEach(function (val) {
        if (this.isLeaf && typeof val == 'string') {
          maskSensitiveValue(val);
        }
      });
    }

    const postRunChecksContext = {
      context: context.vars,
      result,
    };

    if (this.failIfTemplate) {
      if (await this.failIfTemplate.isTrue(postRunChecksContext)) {
        const failResult = await new ModuleFail(
          typeof this.config.failIf == 'string'
            ? 'failIf condition invoked'
            : keepOnlyKeysInJoiSchema(this.config.failIf, ModuleFailFullSchema),
        ).run(context);
        throw new TaskErrorFailedWithIfCondition(failResult.failed);
      }
    } else if (result.failed != undefined) {
      throw new TaskErrorFailedWithExecutionError(result.failed);
    }

    let forceExit = false;
    if (this.exitIfTemplate) {
      if (await this.exitIfTemplate.isTrue(postRunChecksContext)) {
        const exitResult = await new ModuleExit(
          typeof this.config.exitIf == 'string'
            ? 'exitIf condition invoked'
            : keepOnlyKeysInJoiSchema(this.config.exitIf, ModuleExitFullSchema),
        ).run(context);
        forceExit = exitResult.exit == true;

        result.vars ??= {};
        Object.assign(result.vars, exitResult.vars);
      }
    }

    context.logger.info(`Task completed`, { result, forceExit });

    return {
      moduleRunResult: result,
      exit: forceExit || result.exit,
      skipped: false,
      out: taskConfig.out,
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
        `Failed to run task with index ${i}`,
      );

      context.statistics.processedTasksCount++;

      if (taskResult.skipped) {
        context.statistics.skippedTasksCount++;
      }

      if (taskResult.out) {
        accumulatedVars[taskResult.out] = taskResult.moduleRunResult?.vars;
        context.vars[taskResult.out] = taskResult.moduleRunResult?.vars;
      }
      if (task.config.keepPreviousTaskResult != true) {
        context.previousTaskResult = taskResult.moduleRunResult?.vars;
      }

      if (taskResult.moduleRunResult?.changed) {
        changed = true;
      }

      if (taskResult.exit) {
        return {
          exit: true,
          changed,
          accumulatedVars,
        };
      }
    }

    return {
      changed,
      accumulatedVars,
    };
  }
}
