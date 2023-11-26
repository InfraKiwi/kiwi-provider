import { recipeSourceRegistryEntryFactory } from '../registry';
import Joi from 'joi';

export const RecipeSourceDirSchema = recipeSourceRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    path: Joi.string().required(),
  }),
);
