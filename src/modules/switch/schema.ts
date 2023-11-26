import { newDebug } from '../../util/debug';
import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';
import { joiMetaClassName, joiObjectWithPattern, joiValidateValidIfTemplate } from '../../util/joi';
import { TaskSchema } from '../../components/task.schema';

const debug = newDebug(__filename);

const SwitchThenSchema = Joi.alternatives([TaskSchema.required(), Joi.array().items(TaskSchema).min(1).required()]);

export const ModuleSwitchCaseFullSchema = Joi.object({
  // If undefined, this will always be executed
  if: Joi.string().custom(joiValidateValidIfTemplate),

  // If true, the cases evaluation will proceed lower
  fallthrough: Joi.boolean(),

  task: TaskSchema,
  tasks: Joi.array().items(TaskSchema).min(1),
})
  .xor('task', 'tasks')
  .meta(joiMetaClassName('ModuleSwitchCaseFullInterface'));

export const ModuleSwitchSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    value: Joi.any(),
    cases: Joi.alternatives([
      // key -> task
      joiObjectWithPattern(SwitchThenSchema),
      // condition
      Joi.array().items(ModuleSwitchCaseFullSchema),
    ]).required(),
    default: SwitchThenSchema,
  }),
);
