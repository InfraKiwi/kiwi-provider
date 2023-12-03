// Generated with: yarn gen -> cmd/schemaGen.ts

import type { RecipeSourceDirInterface } from './dir/schema.gen';
import type { RecipeSourceGitInterface } from './git/schema.gen';

// [block registryEntriesRecipeSourcesInterface begin]
export interface registryEntriesRecipeSourcesInterface {

  /*
   *
   * ========= Available modules =========
   *
   * Only one of the following keys can be
   * used at the same time.
   *
   */

  dir?: RecipeSourceDirInterface; //typeRef:RecipeSourceDirInterface:dir/schema.gen.ts:true

  git?: RecipeSourceGitInterface; //typeRef:RecipeSourceGitInterface:git/schema.gen.ts:true

}
// [block registryEntriesRecipeSourcesInterface end]
