/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { TaskSchema } from './task.schema';
import {
  getJoiEnumValuesAsAlternatives,
  joiMetaClassName,
  joiObjectWithPattern,
  joiValidateSemVer,
  joiValidateValidJoiSchema,
} from '../util/joi';

import { RecipeSourceListSchema } from '../recipeSources/recipeSourceList.schema';
import { VarsContainerSchemaObject, VarsSchema } from './varsContainer.schema';
import { ConditionSetSchema, TestMockBaseSchema } from './testingCommon.schema';

export const regexRecipeId = /^(?!\.)(?:(\w+):)?(.+)$/;
export const contextVarAssetsDir = '__assetsDir';

export enum RecipePhase {
  bootstrap = 'bootstrap',
  runtime = 'runtime',
}

export const RecipeTargetsSchema = Joi.array().items(Joi.string()).meta(joiMetaClassName('RecipeTargetsInterface'));

export const RecipePhaseSchema = getJoiEnumValuesAsAlternatives(RecipePhase, (entry) => {
  switch (entry) {
    case RecipePhase.bootstrap:
      return `
  Recipes are run in the boostrap phase when the agent is being installed
  on the machine for the first time.
  `;
    case RecipePhase.runtime:
      return `
  Recipes are normally run in the runtime phase.
  `;
  }
})
  .default(RecipePhase.runtime)
  .optional().description(`
Which phase this recipe belongs to.

@default ${RecipePhase.runtime}
`);

export const RecipeDependencySchema = Joi.object({
  // TODO support versioning
  version: Joi.string().custom(joiValidateSemVer),
  sourceId: Joi.string(),
}).meta(joiMetaClassName('RecipeDependencyInterface'));

export const RecipeDependencyWithAlternativesSchema = Joi.alternatives([
  // Just the version
  Joi.string().custom(joiValidateSemVer).allow(null),
  RecipeDependencySchema,
]).meta(joiMetaClassName('RecipeDependencyWithAlternativesInterface'));

const hostVarsBlock = {
  hostVars: joiObjectWithPattern(VarsSchema),
  groupVars: joiObjectWithPattern(VarsSchema),
};

export const HostVarsBlockSchema = Joi.object(hostVarsBlock).meta(joiMetaClassName('HostVarsBlockInterface'));

export const RecipeInputsSchema = joiObjectWithPattern(
  Joi.alternatives([
    // e.g. string, number, e.g.
    Joi.string().valid(
      ...Object.keys(Joi.types())
        .map((k) => [k, `${k}?`])
        .flat()
    ).description(`
    A string that represents a raw type, e.g. string, number, etc.
    If ending with \`?\`, mark the input as optional.
    `),
    Joi.custom(joiValidateValidJoiSchema).description(`
    A Joi validation schema in form of JS code.
     
    Must be defined using the \`!joi\` YAML tag, which makes the \`Joi\` 
    namespace available to use and automatically prepends a \`return\` keyword
    to the provided code.
    
    You can check out more examples of Joi validation at: https://joi.dev/api
    `).example(`
    inputs:
      // Accepts an optional string
      hello: string?
      // Fully validates that \`world\` will be a string of min 3 and max 30 chars
      world: !joi Joi.string().min(3).max(30)
    `),
  ])
).meta({ className: 'RecipeInputsInterface' });

/*
 * NOTE: The RecipeTestMockSchema is defined in this file because, in the end,
 * the recipe is the one that uses the definition of the mock.
 */
export const RecipeTestMockSchema = TestMockBaseSchema.pattern(
  Joi.string(),

  /*
   * NOTE: this explicitly uses the .pattern instead of joiObjectAddPattern to not
   * trigger the TS incompatibility on indexed keys with different value types
   */
  ConditionSetSchema
).meta(joiMetaClassName('RecipeTestMockInterface'));

export const RecipeMinimalSchemaObject = {
  label: Joi.string().description(`
    A friendly label, used to describe the recipe.
  `),

  inputs: RecipeInputsSchema.description(`
    Inputs validation config.
  `),

  dependencies: joiObjectWithPattern(RecipeDependencyWithAlternativesSchema, regexRecipeId).description(`
      A key/value map that lists which other recipes this recipe depends upon.
      Dependencies are bundled at compile time and this list must be exhaustive.
    `),

  tasks: Joi.array().items(TaskSchema).min(1).required().description(`
    The list of tasks to execute in this recipe.
  `),

  ...VarsContainerSchemaObject,
  ...hostVarsBlock,
};

export const RecipeMinimalSchema = Joi.object(RecipeMinimalSchemaObject).meta({ className: 'RecipeMinimalInterface' });

/*
 *The full schema contains all elements that are not allowed in a dependency
 */
export const RecipeSchema = RecipeMinimalSchema.append({
  /*
   * TODO
   * TODO untrusted docs/warning
   * TODO
   */

  targets: RecipeTargetsSchema.description(`
    The list of targets this recipe will run on.
    
    Note: this field is ignored in untrusted recipes.
  `).example(`
  targets:
    - lb-[0:5].hello.com
    - asinglemachine.hello.com
  `),

  phase: RecipePhaseSchema,

  otherHosts: RecipeTargetsSchema.description(`
    If provided, these hosts' vars will also be fetched at recipe compile time.
    Useful when e.g. recipes require other hosts' vars like IP addresses to 
    configure network access rules.
  `),

  recipeSources: RecipeSourceListSchema.description(`
    A list of additional recipe sources to use for this recipe.
  `),

  ...RecipeMinimalSchemaObject,

  ignoreContextSources: Joi.boolean().description(`
    If true, use only the recipe sources provided in the recipe config instead 
    of using the ones also provided by the recipe and the upper context
  `),
})
  .required()
  .meta({ className: 'RecipeInterface' });

export const RecipeForArchiveSchema = Joi.object({
  config: RecipeMinimalSchema.required(),
  targets: RecipeTargetsSchema,
  phase: RecipePhaseSchema,
  otherHosts: RecipeTargetsSchema,
}).meta(joiMetaClassName('RecipeForArchiveInterface'));
