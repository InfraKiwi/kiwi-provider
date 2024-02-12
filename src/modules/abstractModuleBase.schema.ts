/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { VarsSchema } from '../components/varsContainer.schema';
import { joiMetaClassName } from '../util/joi';

export const ModuleRunResultSchema = Joi.object({
  failed: Joi.string().description(`
When a module sets the \`failed\` variable to \`true\`, the execution of
the task is marked as failed and, if there are no other "failure catching"
methods in place, the recipe's execution will be halted.
`),
  exit: Joi.boolean().description(`
When a module sets the \`exit\` variable to \`true\`, the execution of
the recipe will be halted without raising an error.
`),
  vars: VarsSchema.description(`
When a module sets any key/pair into the \`vars\` object, these variables
will be accessible, depending on the task configuration, in the outer
context.
`),
  changed: Joi.boolean().description(`
When a module sets the \`changed\` variable to \`true\`, the task is 
categorized as one that changed the underlying system.
`),
}).meta(joiMetaClassName('ModuleRunResultInterface'));
