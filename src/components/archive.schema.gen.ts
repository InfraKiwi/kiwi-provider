import type { Recipe } from './recipe';
// Generated with: yarn gen -> cmd/schemaGen.ts

import type { RecipeMinimalInterface, RecipeTargetsInterface } from './recipe.schema.gen';

// [block ArchiveInterface begin]
export interface ArchiveInterface {
  rootRecipes: ArchiveRecipesMapInterface; //typeRef:ArchiveRecipesMapInterface:archive.schema.gen.ts:false

  recipeSources: {
    [x: string]: ArchiveRecipesMapInterface; //typeRef:ArchiveRecipesMapInterface:archive.schema.gen.ts:false

  };
  timestamp: number;
}
// [block ArchiveInterface end]

// [block ArchiveRecipeEntryInterface begin]
export interface ArchiveRecipeEntryInterface {
  config: RecipeMinimalInterface; //typeRef:RecipeMinimalInterface:recipe.schema.gen.ts:false

  targets?: RecipeTargetsInterface; //typeRef:RecipeTargetsInterface:recipe.schema.gen.ts:false

  otherHosts?: RecipeTargetsInterface; //typeRef:RecipeTargetsInterface:recipe.schema.gen.ts:false

  assetsArchive?: string;
}
// [block ArchiveRecipeEntryInterface end]

// [block ArchiveRecipesMapInterface begin]
export interface ArchiveRecipesMapInterface {
  [x: string]: ArchiveRecipeEntryInterface; //typeRef:ArchiveRecipeEntryInterface:archive.schema.gen.ts:false

}
// [block ArchiveRecipesMapInterface end]

// [block CreateArchiveArgsInterface begin]
export interface CreateArchiveArgsInterface {
  archiveDir?: string;
  recipes: Recipe[];
}
// [block CreateArchiveArgsInterface end]

// [block RecipeSourceArchiveInterface begin]
export interface RecipeSourceArchiveInterface {
  archive: object;
  uniqueId: string;
  recipesMap: ArchiveRecipesMapInterface; //typeRef:ArchiveRecipesMapInterface:archive.schema.gen.ts:false

  dryRun: boolean;
}
// [block RecipeSourceArchiveInterface end]

export type RecipeSourceArchiveInterfaceConfigKey = 'archive';
export const RecipeSourceArchiveInterfaceConfigKeyFirst = 'archive';
