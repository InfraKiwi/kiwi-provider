/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

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
  })
);
