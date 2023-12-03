import type { KeysMatching, ReadonlyKeys } from './helperTypes';
import type { Logger } from 'winston';
import { defaultLogger } from './logger';
import type { VarsInterface } from '../components/varsContainer.schema.gen';

import type { InventoryHost } from '../components/inventoryHost';
import { RecipeSourceList } from '../recipeSources/recipeSourceList';
import type { ContextLogger, ContextRecipeSourceList, ContextWorkDir } from './context';
import type { TestMock } from '../components/testingCommon';
import type { RunContextPublicVarsInterface } from './runContext.schema.gen';

// eslint-disable-next-line @typescript-eslint/ban-types
type MethodKeysOfRunContext = KeysMatching<RunContext, Function>;
type ReadonlyKeysOfRunContext = ReadonlyKeys<RunContext>;
export type MyPartialRunContextOmit = Omit<RunContext, MethodKeysOfRunContext | ReadonlyKeysOfRunContext>;

export interface RunStatistics {
  totalTasksCount: number;
  processedTasksCount: number;
  skippedTasksCount: number;
  startTime: number;
  endTime?: number;
  failed: boolean;
}

export function newRunStatistics(): RunStatistics {
  return {
    totalTasksCount: 0,
    processedTasksCount: 0,
    skippedTasksCount: 0,
    startTime: new Date().getTime(),
    failed: false,
  };
}

export type RunContextShutdownHookFn = () => void | Promise<void>;

export interface RunContextShutdownHook {
  label: string;
  fn: RunContextShutdownHookFn;
}

export class RunContext
  implements ContextLogger, ContextRecipeSourceList, ContextWorkDir, RunContextPublicVarsInterface {
  logger: Logger = defaultLogger;
  host: InventoryHost;
  vars: VarsInterface = {};
  previousTaskResult?: VarsInterface;
  workDir: string | undefined;

  /**
   * Contains vars that will forcefully exist for each template and cannot
   * be overwritten
   */
  forcedVars: VarsInterface = {};

  /**
   * The list of recipe sources configured in the current context
   */
  recipeSources: RecipeSourceList | undefined;

  /**
   * General execution statistics
   */
  statistics: RunStatistics = newRunStatistics();

  /**
   * Any shutdown hooks that need to be run when the context is closed
   */
  shutdownHooks: RunContextShutdownHook[] = [];

  /**
   * Testing vars
   */
  isTesting = false;
  testMocks: TestMock[] = [];

  // --- Methods ---

  constructor(host: InventoryHost, partial?: Partial<MyPartialRunContextOmit>) {
    this.host = host;
    if (partial) {
      let key: keyof MyPartialRunContextOmit;
      for (key in partial) {
        const val = partial[key]!;
        this[key] = val as never;
      }
    }
  }

  clone(partial?: Partial<MyPartialRunContextOmit>): RunContext {
    return new RunContext(this.host, {
      ...this,
      ...partial,
    });
  }

  get varsForTemplate(): VarsInterface {
    return {
      ...this.vars,
      ctx: this.forcedVars,
    };
  }

  get #aggregateForcedVars(): VarsInterface {
    return {
      hostname: this.host.id,
      isTesting: this.isTesting,
      ...this.forcedVars,
    };
  }

  withLoggerFields(options: object): RunContext {
    if (Object.keys(options).length == 0) {
      return this;
    }
    return this.clone({ logger: this.logger.child(options) });
  }

  withLabel(label: string): RunContext {
    return this.clone({ logger: this.logger.child({ label }) });
  }

  withVars(vars: VarsInterface): RunContext {
    if (Object.keys(vars).length == 0) {
      return this;
    }
    return this.clone({
      vars: {
        ...this.vars,
        ...vars,
      },
    });
  }

  withForcedVars(forcedVars: VarsInterface): RunContext {
    if (Object.keys(forcedVars).length == 0) {
      return this;
    }
    return this.clone({
      forcedVars: {
        ...this.forcedVars,
        ...forcedVars,
      },
    });
  }

  prependTestMocks(testMocks: TestMock[]): RunContext {
    if (testMocks.length == 0) {
      return this;
    }
    return this.clone({ testMocks: [...testMocks, ...this.testMocks] });
  }

  prependRecipeSourceList(recipeSources?: RecipeSourceList): RunContext {
    if (recipeSources == null) {
      return this;
    }
    return this.clone({
      recipeSources: this.recipeSources
        ? RecipeSourceList.mergePrepend(this, recipeSources, this.recipeSources)
        : recipeSources,
    });
  }

  registerShutdownHook(fn: RunContextShutdownHook) {
    this.shutdownHooks.push(fn);
  }

  async executeShutdownHooks() {
    for (const hook of this.shutdownHooks) {
      try {
        await hook.fn();
      } catch (ex) {
        this.logger.error(`Failed to execute shutdown hook: ${hook.label}`, { ex });
      }
    }
  }
}
