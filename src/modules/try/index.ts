/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunContext } from '../../util/runContext';
import {
  ModuleTryContextKeyLastError,
  ModuleTryContextKeyRetry,
  ModuleTryResultKeyFinally,
  ModuleTryResultKeyLastError,
  ModuleTryResultKeyRetries,
  ModuleTrySchema,
} from './schema';
import type { ModuleTryInterface } from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import type { TaskRunTasksInContextResult } from '../../components/task';
import { Task } from '../../components/task';
import type { VarsInterface } from '../../components/varsContainer.schema.gen';
import type { BackoffOptions } from 'exponential-backoff';
import { backOff } from 'exponential-backoff';
import { getErrorCauseChain } from '../../util/error';

export interface ModuleTryResult extends VarsInterface {
  [ModuleTryResultKeyRetries]: number;
  [ModuleTryResultKeyFinally]?: TaskRunTasksInContextResult;
}

export class ModuleTry extends AbstractModuleBase<ModuleTryInterface, ModuleTryResult> {
  async run(context: RunContext): Promise<ModuleRunResult<ModuleTryResult>> {
    const moduleResult: ModuleRunResult<ModuleTryResult> = {
      vars: {
        [ModuleTryResultKeyRetries]: 0,
      },
    };

    let lastError: Error | undefined;
    let retryIndex = 0;
    const maxRetries = this.config.retry?.max ?? 0;

    let backoffOptions: BackoffOptions = {};

    if (this.config.retry?.delay) {
      if (typeof this.config.retry.delay == 'number') {
        // Fixed rate
        backoffOptions.startingDelay = this.config.retry.delay;
        backoffOptions.timeMultiple = 1;
      } else {
        backoffOptions = {
          ...this.config.retry.delay,
        };
      }
    }

    backoffOptions.numOfAttempts = maxRetries + 1;

    try {
      await backOff(async () => {
        // Pre-task
        if (lastError) {
          context.logger.error(`Try task failed, retrying.`, { lastError });
        }

        // Task execution
        try {
          const tasksToExecute = Task.getTasksFromSingleOrArraySchema(this.config.task);
          const result = await Task.runTasksInContext(
            context.withVars({
              [ModuleTryContextKeyRetry]: retryIndex,
            }),
            tasksToExecute
          );

          moduleResult.exit ||= result.exit;
          moduleResult.changed ||= result.changed;
          Object.assign(moduleResult.vars!, result.vars);

          moduleResult.vars![ModuleTryResultKeyRetries] = retryIndex;
          lastError = undefined;
          return;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (ex: any) {
          lastError = ex;
          retryIndex++;
          throw ex;
        }
      }, backoffOptions);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (ex: any) {
      // This is the same as the previous lastError, but using it to keep track of the stack
      lastError = ex;
      context.logger.warn('Backoff failed', { ex });
    }

    if (lastError && this.config.catch) {
      const causeChain = getErrorCauseChain(lastError);
      const tasksToExecute = Task.getTasksFromSingleOrArraySchema(this.config.catch);
      const result = await Task.runTasksInContext(
        context.withVars({
          [ModuleTryContextKeyLastError]: causeChain,
        }),
        tasksToExecute
      );

      moduleResult.exit ||= result.exit;
      moduleResult.changed ||= result.changed;
      Object.assign(moduleResult.vars!, result.vars);
      moduleResult.vars![ModuleTryResultKeyLastError] = causeChain;
      lastError = undefined;
    }

    if (this.config.finally) {
      const tasksToExecute = Task.getTasksFromSingleOrArraySchema(this.config.finally);
      const result = await Task.runTasksInContext(
        context.withVars({
          ...(lastError
            ? {
                [ModuleTryContextKeyLastError]: getErrorCauseChain(lastError),
              }
            : {}),
        }),
        tasksToExecute
      );
      moduleResult.vars![ModuleTryResultKeyFinally] = result;
    }

    if (lastError) {
      throw lastError;
    }

    return moduleResult;
  }
}

moduleRegistryEntryFactory.register(ModuleTrySchema, ModuleTry);
