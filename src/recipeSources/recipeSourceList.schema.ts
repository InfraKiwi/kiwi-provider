import Joi from 'joi';
import { RecipeSourceWrapperSchema } from './recipeSourceWrapper.schema';

export const RecipeSourceListSchema = Joi.array()
  .items(RecipeSourceWrapperSchema)
  .meta({ className: 'RecipeSourceListInterface' });
