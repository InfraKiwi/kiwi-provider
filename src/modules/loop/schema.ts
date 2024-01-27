/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';
import { TaskSingleOrArraySchema } from '../../components/task.schema';

export const ModuleLoopSchemaVarDefault = '__loop';

export const ModuleLoopSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    items: Joi.alternatives([
      Joi.array().description('An array to iterate over.'),
      Joi.object().description('An object to iterate over.'),
    ])
      .required()
      .description('The items to iterate over.'),

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
  `
      )
      .optional(),

    task: TaskSingleOrArraySchema.required(),
  })
);
