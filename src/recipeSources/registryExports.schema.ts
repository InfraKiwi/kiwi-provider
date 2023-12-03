import Joi from 'joi';
import { RecipeSourceDirSchema } from './dir/schema';
import { RecipeSourceGitSchema } from './git/schema';

export const registryEntriesRecipeSourcesSchema = Joi.object({
  dir: RecipeSourceDirSchema,
  git: RecipeSourceGitSchema,
}).meta({ className: 'registryEntriesRecipeSourcesInterface' });
