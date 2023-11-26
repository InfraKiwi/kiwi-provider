import Joi from 'joi';
import { TaskForArchiveSchema, TaskSchema } from './task.schema';
import { joiMetaClassName, joiObjectWithPattern, joiValidateSemVer, joiValidateValidJoiSchema } from '../util/joi';
import { TestMockSchema } from './testing.schema';

import { RecipeSourceListSchema } from '../recipeSources/recipeSourceList.schema';
import { VarsSchema } from './varsContainer.schema';

export const regexRecipeId = /^(?:(\w+):)?(.+)$/;

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
  ]),
).meta({ className: 'RecipeInputsInterface' });

export const RecipeAsDependencySchema = Joi.object({
  dependencies: joiObjectWithPattern(RecipeDependencyWithAlternativesSchema, regexRecipeId),

  tasks: Joi.array().items(TaskForArchiveSchema).min(1).required(),

  vars: VarsSchema,

  // Input validation
  inputs: RecipeInputsSchema,
})
  .append(hostVarsBlock)
  .meta({ className: 'RecipeAsDependencyInterface' });

/*
The full schema contains all elements that are not allowed in a dependency
 */
export const RecipeSchema = RecipeAsDependencySchema.append({
  // The list of targets this recipe will be run on
  targets: RecipeTargetsSchema,

  // If provided, these hosts' vars will also be fetched at recipe compile time
  otherHosts: RecipeTargetsSchema,

  // Overwrite the previous definition
  tasks: Joi.array().items(TaskSchema).min(1).required(),

  recipeSources: RecipeSourceListSchema,

  // If true, use only the recipe sources provided in the recipe config instead of using the ones also provided
  // by the recipe and the upper context
  ignoreContextSources: Joi.boolean(),

  vars: VarsSchema,

  mocks: Joi.array().items(TestMockSchema),
})
  .required()
  .meta({ className: 'RecipeInterface' });

export const RecipeForArchiveSchema = Joi.object({
  config: RecipeAsDependencySchema.required(),
  targets: RecipeTargetsSchema,
  otherHosts: RecipeTargetsSchema,
}).meta(joiMetaClassName('RecipeForArchiveInterface'));
