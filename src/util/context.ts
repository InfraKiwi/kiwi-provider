/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { Logger } from 'winston';
import type { RecipeSourceList } from '../recipeSources/recipeSourceList';

export interface ContextLogger {
  logger: Logger;
}

export interface ContextWorkDir {
  workDir?: string;
}

export interface ContextRecipeSourceList {
  recipeSources?: RecipeSourceList;
}
