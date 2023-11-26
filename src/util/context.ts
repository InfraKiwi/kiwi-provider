import type { Logger } from 'winston';
import type { RecipeSourceList } from '../recipeSources/recipeSourceList';

export interface ContextLogger {
  logger: Logger;
}

export interface ContextWorkDir {
  workDir: string | undefined;
}

export interface ContextRecipeSourceList {
  recipeSources: RecipeSourceList | undefined;
}
