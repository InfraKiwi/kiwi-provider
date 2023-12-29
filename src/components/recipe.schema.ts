/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { TaskSchema } from './task.schema';
import { joiMetaClassName, joiObjectWithPattern, joiValidateSemVer, joiValidateValidJoiSchema } from '../util/joi';

import { RecipeSourceListSchema } from '../recipeSources/recipeSourceList.schema';
import { VarsContainerSchemaObject, VarsSchema } from './varsContainer.schema';
import { ConditionSetSchema, TestMockBaseSchema } from './testingCommon.schema';

export const regexRecipeId = /^(?:(\w+):)?(.+)$/;
export const contextVarAssetsDir = '__assetsDir';

export const RecipeTargetsSchema = Joi.array().items(Joi.string()).meta(joiMetaClassName('RecipeTargetsInterface'));

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
    Joi.string().allow(...Object.keys(Joi.types())),
    // A full-fledged schema
    Joi.custom(joiValidateValidJoiSchema),
  ])
).meta({ className: 'RecipeInputsInterface' });

export const RecipeTestMockSchema = TestMockBaseSchema.pattern(
  Joi.string(),

  /*
   * NOTE: this explicitly uses the .pattern instead of joiObjectAddPattern to not
   * trigger the TS incompatibility on indexed keys with different value types
   */
  ConditionSetSchema
).meta(joiMetaClassName('RecipeTestMockInterface'));

export const RecipeMinimalSchema = Joi.object({
  // What other recipes we depend on
  dependencies: joiObjectWithPattern(RecipeDependencyWithAlternativesSchema, regexRecipeId),

  // The tasks to execute in this recipe
  tasks: Joi.array().items(TaskSchema).min(1).required(),

  // Input validation
  inputs: RecipeInputsSchema,

  // Enabled only in testing mode
  testMocks: Joi.array().items(RecipeTestMockSchema),

  ...VarsContainerSchemaObject,
  ...hostVarsBlock,
}).meta({ className: 'RecipeMinimalInterface' });

/*
 *The full schema contains all elements that are not allowed in a dependency
 */
export const RecipeSchema = RecipeMinimalSchema.append({
  // The list of targets this recipe will be run on
  targets: RecipeTargetsSchema,

  // If provided, these hosts' vars will also be fetched at recipe compile time
  otherHosts: RecipeTargetsSchema,

  recipeSources: RecipeSourceListSchema,

  /*
   * If true, use only the recipe sources provided in the recipe config instead of using the ones also provided
   * by the recipe and the upper context
   */
  ignoreContextSources: Joi.boolean(),
})
  .required()
  .meta({ className: 'RecipeInterface' });

export const RecipeForArchiveSchema = Joi.object({
  config: RecipeMinimalSchema.required(),
  targets: RecipeTargetsSchema,
  otherHosts: RecipeTargetsSchema,
}).meta(joiMetaClassName('RecipeForArchiveInterface'));

export const TestRecipeMinimalSchema = RecipeMinimalSchema.append({}).meta(
  joiMetaClassName('TestRecipeMinimalInterface')
);
