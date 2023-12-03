import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';
import { RecipeDependencySchema, regexRecipeId } from '../../components/recipe.schema';
import { joiMetaClassName } from '../../util/joi';

export const ModuleRecipeFullSchema = RecipeDependencySchema.append({
  id: Joi.string().regex(regexRecipeId).required(),
}).meta(joiMetaClassName('ModuleRecipeFullInterface'));

export const ModuleRecipeSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.alternatives([Joi.string(), ModuleRecipeFullSchema]),
);
