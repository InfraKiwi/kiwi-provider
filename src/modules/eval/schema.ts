/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';
import { RunContextPublicVarsSchema } from '../../util/runContext.schema';
import { VarsSchema } from '../../components/varsContainer.schema';
import { joiMetaClassName } from '../../util/joi';

export const EvalContextSchema = Joi.object({
  context: RunContextPublicVarsSchema.required(),
  result: Joi.object({
    vars: VarsSchema.required().description(`Any variables to propagate to the outer scope.`),
  }).required().description(`
    The result of the \`eval\` module.
  `),
}).meta(joiMetaClassName('EvalContextInterface'));

export const EvalContextFileSchema = EvalContextSchema.append({
  __filename: Joi.string().required().description(`
    The path of the file being executed by the \`eval\` module.
  `),
}).meta(joiMetaClassName('EvalContextFileInterface'));

export const EvalFunctionSchema = Joi.function()
  .meta({
    baseType: '((context: EvalContextInterface) => void | Promise<void>)',
  })
  .meta(joiMetaClassName('EvalFunctionInterface'));

export const ModuleEvalSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.alternatives([
    Joi.string().description(`
      Some plain JS code.
    `),
    Joi.object({
      code: Joi.alternatives([
        Joi.string().description(`
        Some plain JS code.
      `),
        EvalFunctionSchema.description(`
        A JS function. This feature is only available when the recipe is a JS/TS file.
      `),
      ]),
      file: Joi.string().description(`
      The path to a JS file to execute. 
    `),
    }).xor('code', 'file').description(`
    Evaluates JS code. Only one of \`code\` and \`file\` can be specified at the same time.
  `),
  ])
);
