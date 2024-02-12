/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';
import { TaskRunTasksInContextResultSchema, TaskSingleOrArraySchema } from '../../components/task.schema';
import { joiMetaClassName } from '../../util/joi';
import { VarsSchema } from '../../components/varsContainer.schema';
const ModuleTryResultKeyFinally = 'finally';
export const ModuleTryResultSchema = Joi.object({
  vars: VarsSchema.required().description(`
    The variables returned by the successful task, if any.
    If the main task fails, and the \`catch\` block succeeds, these 
    variables will contain the result of the \`catch\` block.
  `),
  lastError: Joi.string().description(`
    A string description of the last caught error, if any.
    If \`retries\` are enabled and the main task succeeds after retrying,
    the \`lastError\` variable will be undefined.
  `),
  caught: Joi.boolean().required().description(`
    True if an error has been caught.
    If \`retries\` are enabled and the main task succeeds after retrying,
    the \`caught\` variable will be \`false\`.
  `),
  [ModuleTryResultKeyFinally]: TaskRunTasksInContextResultSchema.description(`
    The result of the recipe executed in the \`finally\` block, if any.
  `),
  retries: Joi.number().required().description(`
    The amount of retries used for the task to succeed.
    This number can be > 0 only if retries have been configured.
  `),
}).meta(joiMetaClassName('ModuleTryResultInterface'));

export const ModuleTryContextKeyRetry = '__retry';
export const ModuleTryContextKeyLastError = '__lastError';

const BackoffOptionsSchema = Joi.object({
  delayFirstAttempt: Joi.boolean().default(false).optional().description(`
    Decides whether the \`startingDelay\` should be applied before the first call. 
    If false, the first call will occur without a delay.
  `),
  jitter: Joi.string().valid('full', 'none').default('none').optional().description(`
    Decides whether a jitter should be applied to the delay.
    Ref: https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
  `),
  maxDelay: Joi.number().integer().description(`
    The maximum delay, in milliseconds, between two consecutive attempts.
    Default value is Infinity.
  `),
  numOfAttempts: Joi.number().integer().min(1).default(10).optional().description(`
    The maximum number of times to attempt the function.
    Minimum value is 1.
  `),
  // retry: (e: any, attemptNumber: number) => boolean | Promise<boolean>,
  startingDelay: Joi.number().integer().default(500).optional().description(`
    The delay, in milliseconds, before executing the function for the first time.
    Only applied if \`delayFirstAttempt\` is \`true\`.
  `),
  timeMultiple: Joi.number().integer().default(2).optional().description(`
    The \`startingDelay\` is multiplied by the \`timeMultiple\` to increase the delay between reattempts.
  `),
});

export const ModuleTryRetrySchema = Joi.object({
  max: Joi.number().integer().min(1).default(10).optional().description(`
    The maximum amount of retries. Defaults to 10.
  `),
  delay: Joi.alternatives([
    Joi.number().integer().description(`
      The amount of milliseconds to wait between each retry.
    `),
    BackoffOptionsSchema.description(`
      The configuration of retries using an exponential backoff.
      Ref: https://github.com/coveooss/exponential-backoff
    `),
  ])
    .default(1000)
    .optional().description(`
    The delay between each retry.
    Defaults to a 1-second fixed-rate delay. 
  `),
}).meta(joiMetaClassName('ModuleTryRetryInterface'));

export const ModuleTrySchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    task: TaskSingleOrArraySchema.required().description(`
      The task to execute. A failure of this task can be caught by using
      the \`catch\` field.
    `),
    catch: TaskSingleOrArraySchema.description(`
      The task to execute if the main one has failed.
      Note: if a task of the \`catch\` branch throws an error, it will NOT be 
      caught.
    `),
    finally: TaskSingleOrArraySchema.description(`
      A task to execute independently on the result of the main task.
      If the main task has failed, the \`finally\` task will be executed but the 
      overall module will still be considered as failed.
      Note: the result of the \`finally\` task will be available under the \`${ModuleTryResultKeyFinally}\` 
      variable, contained in the overall module result.
    `),
    retry: ModuleTryRetrySchema.description(`
      Retries configuration for the main task.
      If the main task exceeds the configured retries, it will be considered
      as failed, and can be eventually caught with the \`catch\` field.
    `),
  })
);
