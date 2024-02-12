/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

import type { TaskSingleOrArrayInterface } from '../../components/task.schema.gen';
import type { VarsInterface } from '../../components/varsContainer.schema.gen';
import type { TaskRunTasksInContextResultInterface } from '../../components/task.schema.gen';

// [block ModuleTryInterface begin]
export interface ModuleTryInterface {
  /**
   * The task to execute. A failure of this task can be caught by using
   * the `catch` field.
   */
  task: TaskSingleOrArrayInterface; //typeRef:TaskSingleOrArrayInterface:{"relPath":"../../components/task.schema.gen.ts","isRegistryExport":false}

  /**
   * The task to execute if the main one has failed.
   * Note: if a task of the `catch` branch throws an error, it will NOT be
   * caught.
   */
  catch?: TaskSingleOrArrayInterface; //typeRef:TaskSingleOrArrayInterface:{"relPath":"../../components/task.schema.gen.ts","isRegistryExport":false}

  /**
   * A task to execute independently on the result of the main task.
   * If the main task has failed, the `finally` task will be executed but the
   * overall module will still be considered as failed.
   * Note: the result of the `finally` task will be available under the `finally`
   * variable, contained in the overall module result.
   */
  finally?: TaskSingleOrArrayInterface; //typeRef:TaskSingleOrArrayInterface:{"relPath":"../../components/task.schema.gen.ts","isRegistryExport":false}

  /**
   * Retries configuration for the main task.
   * If the main task exceeds the configured retries, it will be considered
   * as failed, and can be eventually caught with the `catch` field.
   */
  retry?: ModuleTryRetryInterface; //typeRef:ModuleTryRetryInterface:{"relPath":"self","isRegistryExport":false}
}
// [block ModuleTryInterface end]
//meta:ModuleTryInterface:[{"className":"ModuleTryInterface","entryNames":["try"]}]

// [block ModuleTryResultInterface begin]
export interface ModuleTryResultInterface {
  /**
   * The variables returned by the successful task, if any.
   * If the main task fails, and the `catch` block succeeds, these
   * variables will contain the result of the `catch` block.
   */
  vars: VarsInterface; //typeRef:VarsInterface:{"relPath":"../../components/varsContainer.schema.gen.ts","isRegistryExport":false}

  /**
   * A string description of the last caught error, if any.
   * If `retries` are enabled and the main task succeeds after retrying,
   * the `lastError` variable will be undefined.
   */
  lastError?: string;

  /**
   * True if an error has been caught.
   * If `retries` are enabled and the main task succeeds after retrying,
   * the `caught` variable will be `false`.
   */
  caught: boolean;

  /**
   * The result of the recipe executed in the `finally` block, if any.
   */
  finally?: TaskRunTasksInContextResultInterface; //typeRef:TaskRunTasksInContextResultInterface:{"relPath":"../../components/task.schema.gen.ts","isRegistryExport":false}

  /**
   * The amount of retries used for the task to succeed.
   * This number can be > 0 only if retries have been configured.
   */
  retries: number;
}
// [block ModuleTryResultInterface end]
//meta:ModuleTryResultInterface:[{"className":"ModuleTryResultInterface"}]

// [block ModuleTryRetryInterface begin]
export interface ModuleTryRetryInterface {
  /**
   * The maximum amount of retries. Defaults to 10.
   */
  max?:
    | 10
    | number;

  /**
   * The delay between each retry.
   * Defaults to a 1-second fixed-rate delay.
   */
  delay?:
    | 1000

    /**
     * The amount of milliseconds to wait between each retry.
     */
    | number

    /**
     * The configuration of retries using an exponential backoff.
     * Ref: https://github.com/coveooss/exponential-backoff
     */
    | ({
      /**
       * Decides whether the `startingDelay` should be applied before the first call.
       * If false, the first call will occur without a delay.
       */
      delayFirstAttempt?:
        | false
        | boolean;

      /**
       * Decides whether a jitter should be applied to the delay.
       * Ref: https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
       */
      jitter?:
        | 'full'
        | 'none';

      /**
       * The maximum delay, in milliseconds, between two consecutive attempts.
       * Default value is Infinity.
       */
      maxDelay?: number;

      /**
       * The maximum number of times to attempt the function.
       * Minimum value is 1.
       */
      numOfAttempts?:
        | 10
        | number;

      /**
       * The delay, in milliseconds, before executing the function for the first time.
       * Only applied if `delayFirstAttempt` is `true`.
       */
      startingDelay?:
        | 500
        | number;

      /**
       * The `startingDelay` is multiplied by the `timeMultiple` to increase the delay between reattempts.
       */
      timeMultiple?:
        | 2
        | number;
    });
}
// [block ModuleTryRetryInterface end]
//meta:ModuleTryRetryInterface:[{"className":"ModuleTryRetryInterface"}]

export type ModuleTryInterfaceConfigKey = 'try';
export const ModuleTryInterfaceConfigKeyFirst = 'try';
