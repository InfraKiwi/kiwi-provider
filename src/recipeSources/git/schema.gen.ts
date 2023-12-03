// Generated with: yarn gen -> cmd/schemaGen.ts

// [block RecipeSourceGitInterface begin]
export interface RecipeSourceGitInterface {
  url: string;
  rootPath: 'recipes' | string;
  ref: 'master' | string;
  cache: true | boolean;
}
// [block RecipeSourceGitInterface end]

export type RecipeSourceGitInterfaceConfigKey = 'git';
export const RecipeSourceGitInterfaceConfigKeyFirst = 'git';
