import { recipeSourceRegistryEntryFactory } from '../registry';
import Joi from 'joi';

export const RecipeSourceGitDefaultRootPath = 'recipes';
export const RecipeSourceGitDefaultRef = 'master';

export const RecipeSourceGitSchema = recipeSourceRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    url: Joi.string().required(),

    // By default, expect recipes to be inside this folder
    rootPath: Joi.string().default(RecipeSourceGitDefaultRootPath),
    ref: Joi.string().default(RecipeSourceGitDefaultRef),

    // If enabled, it will reuse already checked-out repos/folders
    cache: Joi.boolean().default(true),
  }),
);
