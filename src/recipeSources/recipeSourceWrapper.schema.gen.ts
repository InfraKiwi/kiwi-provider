/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
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
   * Unknown Property
   */
  [x: string]: unknown;
}
// [block RecipeSourceWrapperInterface end]
//meta:RecipeSourceWrapperInterface:[{"className":"RecipeSourceWrapperInterface"}]
