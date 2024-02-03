/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { joiMetaClassName, joiMetaUnknownType } from '../util/joi';
import { VarsSchema } from './varsContainer.schema';
import { ModuleFailFullSchema } from '../modules/fail/schema';
import { ModuleExitFullSchema } from '../modules/exit/schema';
import { ConditionSetSchema, TestMockBaseSchema } from './testingCommon.schema';
import { joiMetaDelayTemplatesResolution, joiValidateValidIfTemplate } from '../util/tpl';

export const taskPreviousTaskResultContextKey = '__previousTaskResult';

export const FailedIfFullSchema = ModuleFailFullSchema.append({
  if: Joi.alternatives([Joi.string().custom(joiValidateValidIfTemplate), Joi.boolean()]).required(),
}).meta(joiMetaClassName('FailedIfFullInterface'));

export const ExitIfFullSchema = ModuleExitFullSchema.append({
  if: Joi.alternatives([Joi.string().custom(joiValidateValidIfTemplate), Joi.boolean()]).required(),
}).meta(joiMetaClassName('ExitIfFullInterface'));

export const TaskTestMockSchema = TestMockBaseSchema.append({ if: ConditionSetSchema }).meta(
  joiMetaClassName('TaskTestMockInterface')
);

export const postChecksContextResultKey = '__result';

export const TaskSchema = Joi.object({
  name: Joi.string().description(`
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
  If provided, registers any output variables into a variable with the name
  provided as value of the \`out\` argument.
  `),

  outRaw: Joi.string().description(`
  If provided, registers the full module result into a variable with the name
  provided as value of the \`outRaw\` argument.
  `),

  global: Joi.boolean().description(`
  If true, registers any output variables into the global context.
  `),

  sensitive: Joi.boolean().description(`  
  If true, all registered variables will be treated as secrets
  E.g. useful for logging purposes.
  `),

  failedIf: Joi.alternatives([Joi.string().custom(joiValidateValidIfTemplate), FailedIfFullSchema, Joi.boolean()])
    .description(`
  When provided, the task will fail if this condition succeeds.
  Expects a template that would work inside an \`if\` condition.
  
  The context available for this condition is the same one available at
  the module's resolution time, plus the additional field \`${postChecksContextResultKey}\`,
  which contains the result of the module.
  
  The \`${postChecksContextResultKey}\` field is of type ModuleRunResultInterface. ##typeRef:ModuleRunResultInterface:{"relPath":"../modules/abstractModuleBase.schema.gen.ts"}
`),

  exitIf: Joi.alternatives([Joi.string().custom(joiValidateValidIfTemplate), ExitIfFullSchema, Joi.boolean()])
    .description(`
  When provided, the recipe will stop successfully if this condition succeeds.
  Expects a template that would work inside an \`if\` condition.  
  
  The context available for this condition is the same one available at
  the module's resolution time, plus the additional field \`${postChecksContextResultKey}\`,
  which contains the result of the module.
  
  The \`${postChecksContextResultKey}\` field is of type ModuleRunResultInterface. ##typeRef:ModuleRunResultInterface:{"relPath":"../modules/abstractModuleBase.schema.gen.ts"}
`),

  keepPreviousTaskResult: Joi.boolean().description(`
    Really only meant for debugging purposes, preserves the result of the
    previous task in the \`${taskPreviousTaskResultContextKey}\` variable and does
    not overwrite it. E.g. useful while using the debug module.
  `),

  // TODO omit in docs (new metadata feature?)
  testMocks: Joi.array().items(TaskTestMockSchema).description(`
  Enabled only in testing mode.
  `),
})
  .unknown(true)
  .meta({
    className: 'TaskInterface',
    ...joiMetaUnknownType(
      Joi.any().description(`
    The module to use in the task.
    You can check the available task modules here: ##link#See all available task modules#/modules
    `)
    ),
  })
  .description(
    `
  Defines a task to be executed.
  `
  );

export const TaskSingleOrArraySchema = Joi.alternatives([
  TaskSchema.description('The task to be executed.'),
  Joi.array().items(TaskSchema).min(1).description('An array of tasks to be executed.'),
]).meta({
  ...joiMetaClassName('TaskSingleOrArrayInterface'),
  ...joiMetaDelayTemplatesResolution(),
});

export const TaskRunTasksInContextResultSchema = Joi.object({
  changed: Joi.boolean().required(),
  exit: Joi.boolean().description(`
    True if the task chain exited on demand.
  `),
  vars: VarsSchema.required().description(`
    The variables set in the task chain.
  `),
}).meta(joiMetaClassName('TaskRunTasksInContextResultInterface'));
