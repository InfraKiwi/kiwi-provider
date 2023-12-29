/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';
import { joiMetaClassName, joiObjectWithPattern, joiValidateValidIfTemplate } from '../../util/joi';
import { TaskSchema } from '../../components/task.schema';

const SwitchThenSchema = Joi.alternatives([
  TaskSchema.description('The task to be executed.'),
  Joi.array().items(TaskSchema).min(1).description('An array of tasks to be executed.'),
]).description('The task configuration');

export const ModuleSwitchCaseFullSchema = Joi.object({
  if: Joi.string().custom(joiValidateValidIfTemplate).description(`
  If the \`if\` condition is undefined, this case will always be executed.
  `),

  fallthrough: Joi.boolean().description(`
  If true, the evaluation will proceed also to the next case.
  `),

  task: SwitchThenSchema.required(),
}).meta(joiMetaClassName('ModuleSwitchCaseFullInterface'));

export const ModuleSwitchSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    value: Joi.any().description('The value to evaluate.'),
    cases: Joi.alternatives([
      // key -> task
      joiObjectWithPattern(SwitchThenSchema).description(`
      An object, where each key represents a case match and the value the task config.
      `),
      // condition
      Joi.array().items(ModuleSwitchCaseFullSchema).description(`
      An array of conditions to evaluate.
      `),
    ]).required().description(`
    The definition of all cases to evaluate.
    `),
    default: SwitchThenSchema.description(`
    The default case, which is executed if no other cases match successfully.
    `),
  })
);
