import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';
import { TaskSchema } from '../../components/task.schema';

export const ModuleLoopSchemaVarDefault = '__loop';

export const ModuleLoopSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    items: Joi.alternatives([
      Joi.array().description(`An array to iterate over.`),
      Joi.object().description(`An object to iterate over.`),
    ])
      .required()
      .description(`The items to iterate over.`),

    var: Joi.string()
      .default(ModuleLoopSchemaVarDefault)
      .description(
        `
  The name of the variable that will be injected in the context for 
  every loop iteration.
  
  If \`items\` is an object, the loop variable will contain the following entries:
  - \`key\`: the current key of the object.
  - \`item\`: the corresponding value.
  
  If \`items\` is an array, the loop variable will contain the following entries:
  - \`key\`: the current index of the array (number).
  - \`item\`: the corresponding value.
  `,
      )
      .optional(),

    task: Joi.alternatives([
      TaskSchema.description(`The task to be executed.`),
      Joi.array().items(TaskSchema).min(1).description(`An array of tasks to be executed.`),
    ]).required(),
  }),
);
