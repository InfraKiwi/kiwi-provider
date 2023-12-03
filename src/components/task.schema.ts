import Joi from 'joi';
import { joiMetaClassName, joiValidateValidIfTemplate } from '../util/joi';
import { VarsSchema } from './varsContainer.schema';
import { ModuleFailFullSchema } from '../modules/fail/schema';
import { ModuleExitFullSchema } from '../modules/exit/schema';
import { TestMockBaseSchema, ConditionSetSchema } from './testingCommon.schema';

export const FailedIfFullInterface = ModuleFailFullSchema.append({
  if: Joi.string().custom(joiValidateValidIfTemplate).required(),
}).meta(joiMetaClassName('FailedIfFullInterface'));

export const ExitIfFullInterface = ModuleExitFullSchema.append({
  if: Joi.string().custom(joiValidateValidIfTemplate).required(),
}).meta(joiMetaClassName('ExitIfFullInterface'));

export const TaskTestMockSchema = TestMockBaseSchema.append({
  if: ConditionSetSchema,
}).meta(joiMetaClassName('TaskTestMockInterface'));

export const TaskSchema = Joi.object({
  /*
  A friendly identifier for the task
  */
  label: Joi.string(),

  /*
  When provided, the task will be executed only if this condition succeeds.
  Expects a template that would work inside an `if` condition.
  */
  if: Joi.string().custom(joiValidateValidIfTemplate),

  /*
  When provided, the task will fail if this condition succeeds.
  Expects a template that would work inside an `if` condition.
   */
  failedIf: Joi.alternatives([Joi.string().custom(joiValidateValidIfTemplate), FailedIfFullInterface]),

  /*
  When provided, the recipe will stop successfully if this condition succeeds.
  Expects a template that would work inside an `if` condition.
   */
  exitIf: Joi.alternatives([Joi.string().custom(joiValidateValidIfTemplate), ExitIfFullInterface]),

  /*
  If provided, registers any output variables into the variable name
  provided as value of the `out` argument
  */
  out: Joi.string(),

  /*
  If true, all registered variables will be treated as secrets
  E.g. useful for logging purposes
  */
  sensitive: Joi.boolean(),

  /*
  Any vars you want to provide to the task
  */
  vars: VarsSchema,

  /*
  Really only meant for debugging purposes, preserves the result of the
  previous task and does not overwrite it. E.g. useful while using the debug
  module
  */
  keepPreviousTaskResult: Joi.boolean(),

  // Enabled only in testing mode
  testMocks: Joi.array().items(TaskTestMockSchema),
})
  .unknown(true)
  .meta({ className: 'TaskInterface' });
