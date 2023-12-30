/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

// [block RecipeSourceGitInterface begin]
export interface RecipeSourceGitInterface {
  url: string;
  rootPath:
    | 'recipes'
    | string;
  ref:
    | 'master'
    | string;
  cache:
    | true
    | boolean;
}
// [block RecipeSourceGitInterface end]
//meta:RecipeSourceGitInterface:[{"className":"RecipeSourceGitInterface","entryNames":["git"]}]

export type RecipeSourceGitInterfaceConfigKey = 'git';
export const RecipeSourceGitInterfaceConfigKeyFirst = 'git';
