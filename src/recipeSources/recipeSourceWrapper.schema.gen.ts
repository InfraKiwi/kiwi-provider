/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

// [block RecipeSourceWrapperInterface begin]
export interface RecipeSourceWrapperInterface {
  trusted?: boolean;
  skipPropagate?: boolean;
  id?: string;
  workDir?: string;

  /**
   * The recipe source config.
   * You can check the available recipe sources here: ##link#See all available recipe sources#/recipeSources
   */
  [x: string]: any;
}
// [block RecipeSourceWrapperInterface end]
//meta:RecipeSourceWrapperInterface:[{"className":"RecipeSourceWrapperInterface"},{"unknownType":{"type":"any","flags":{"description":"\n  The recipe source config.\n  You can check the available recipe sources here: ##link#See all available recipe sources#/recipeSources\n"}}}]
