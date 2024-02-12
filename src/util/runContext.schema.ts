/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { joiMetaClassName, joiObjectFromInstanceOf } from './joi';
import path from 'node:path';
import { VarsSchema } from '../components/varsContainer.schema';

export const RunContextPublicVarsSchema = Joi.object({
  logger: joiObjectFromInstanceOf('Logger', 'winston').required().description(`
  The logger provided by the context
  `),

  host: joiObjectFromInstanceOf('InventoryHost', path.resolve(__dirname, '../components/inventoryHost.ts')).required()
    .description(`
  The current host
  `),

  vars: VarsSchema.required().description(`
 Contains the vars shared by all modules
 `),

  previousTaskResult: VarsSchema.description(`
  When tasks are executed, this will always contain the previous task's
  result, unless the previous task is configured with
  \`keepPreviousTaskResult: true\`, in which case the previous task's result
  will be ignored.
 `),

  workDir: Joi.string().description(`
  The current working directory, used by default by any modules that
  operate on the file-system.
  `),

  isTesting: Joi.boolean().required().description(`
  True only when the recipe is being executes through a test suite.
  `),
}).meta(joiMetaClassName('RunContextPublicVarsInterface')).description(`
  The context available in every task module's execution.
`);
