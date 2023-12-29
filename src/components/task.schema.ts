/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { joiMetaClassName, joiMetaUnknownType, joiValidateValidIfTemplate } from '../util/joi';
import { VarsSchema } from './varsContainer.schema';
import { ModuleFailFullSchema } from '../modules/fail/schema';
import { ModuleExitFullSchema } from '../modules/exit/schema';
import { ConditionSetSchema, TestMockBaseSchema } from './testingCommon.schema';

export const FailedIfFullSchema = ModuleFailFullSchema.append({
  if: Joi.string().custom(joiValidateValidIfTemplate).required(),
}).meta(joiMetaClassName('FailedIfFullInterface'));

export const ExitIfFullSchema = ModuleExitFullSchema.append({
  if: Joi.string().custom(joiValidateValidIfTemplate).required(),
}).meta(joiMetaClassName('ExitIfFullInterface'));

export const TaskTestMockSchema = TestMockBaseSchema.append({ if: ConditionSetSchema }).meta(
  joiMetaClassName('TaskTestMockInterface')
);

export const TaskSchema = Joi.object({
  label: Joi.string().description(`
  A friendly identifier for the task, which will be printed in logs.
`),

  if: Joi.string().custom(joiValidateValidIfTemplate).description(`
  When provided, the task will be executed only if this condition succeeds.
  Expects a template that would work inside an \`if\` condition.
`),

  vars: VarsSchema.description(`
  Any vars you want to provide to the task.
  `),

  out: Joi.string().description(`
  If provided, registers any output variables into the variable name
  provided as value of the \`out\` argument.
  `),

  failedIf: Joi.alternatives([Joi.string().custom(joiValidateValidIfTemplate), FailedIfFullSchema]).description(`
  When provided, the task will fail if this condition succeeds.
  Expects a template that would work inside an \`if\` condition.
`),

  exitIf: Joi.alternatives([Joi.string().custom(joiValidateValidIfTemplate), ExitIfFullSchema]).description(`
  When provided, the recipe will stop successfully if this condition succeeds.
  Expects a template that would work inside an \`if\` condition.  
`),

  global: Joi.boolean().description(`
  If true, registers any output variables into the global context.
  `),

  sensitive: Joi.boolean().description(`  
  If true, all registered variables will be treated as secrets
  E.g. useful for logging purposes.
  `),

  keepPreviousTaskResult: Joi.boolean().description(`
  Really only meant for debugging purposes, preserves the result of the
  previous task and does not overwrite it. E.g. useful while using the debug
  module.
  `),

  // TODO
  testMocks: Joi.array().items(TaskTestMockSchema).description(`
  Enabled only in testing mode.
  `),
})
  .unknown(true)
  .meta({
    className: 'TaskInterface',
    ...joiMetaUnknownType(Joi.any().description(`
    The module to use in the task.
    You can check the available task modules here: ##link#See all available task modules#/modules
    `)),
  })
  .description(
    `
  Defines a task to be executed.
  `
  );
