/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';
import { RecipeDependencySchema, regexRecipeId } from '../../components/recipe.schema';
import { joiMetaClassName } from '../../util/joi';

export const ModuleRecipeFullSchema = RecipeDependencySchema.append({
  id: Joi.string().regex(regexRecipeId).required(),
}).meta(joiMetaClassName('ModuleRecipeFullInterface'));

export const ModuleRecipeSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.alternatives([Joi.string(), ModuleRecipeFullSchema])
);
