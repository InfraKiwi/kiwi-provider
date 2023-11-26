import Joi from 'joi';
import { joiMetaClassName, joiValidateValidIfTemplate } from '../util/joi';
import { TestMockSchema, TestMockSchemaBase } from './testing.schema';
import { VarsSchema } from './varsContainer.schema';
import { ModuleFailFullSchema } from '../modules/fail/schema';
import { ModuleExitFullSchema } from '../modules/exit/schema';

export const FailIfFullInterface = ModuleFailFullSchema.append({
  if: Joi.string().custom(joiValidateValidIfTemplate).required(),
}).meta(joiMetaClassName('FailIfFullInterface'));

export const ExitIfFullInterface = ModuleExitFullSchema.append({
  if: Joi.string().custom(joiValidateValidIfTemplate).required(),
}).meta(joiMetaClassName('ExitIfFullInterface'));

export const TaskForArchiveSchema = Joi.object({
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
  failIf: Joi.alternatives([Joi.string().custom(joiValidateValidIfTemplate), FailIfFullInterface]),

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
})
  .unknown(true)
  .meta({ className: 'TaskForArchiveInterface' });

export const TaskSchema = TaskForArchiveSchema.append({
  /*
  It is possible to define mocks for each individual task, both in the shape of a normal mocks
  array, or in the shape of a single fixed mock, which will always be used without any condition testing
  */
  mocks: Joi.array().items(TestMockSchema),
  mock: TestMockSchemaBase,
  ignoreMocks: Joi.boolean(),
})
  .nand('mocks', 'mock', 'ignoreMocks')
  .meta({ className: 'TaskInterface' });
