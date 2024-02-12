/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { recipeSourceRegistryEntryFactory } from '../registry';
import Joi from 'joi';

export const RecipeSourceDirSchema = recipeSourceRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    path: Joi.string().required(),
  })
);
