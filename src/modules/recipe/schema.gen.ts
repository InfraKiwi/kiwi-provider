/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ModuleRecipeFullInterface begin]
export interface ModuleRecipeFullInterface {
  version?: string;
  sourceId?: string;
  id: string;
}
// [block ModuleRecipeFullInterface end]
//meta:ModuleRecipeFullInterface:[{"className":"RecipeDependencyInterface"},{"className":"ModuleRecipeFullInterface"}]

// [block ModuleRecipeInterface begin]
export type ModuleRecipeInterface =
  | string
  | ModuleRecipeFullInterface; //typeRef:ModuleRecipeFullInterface:{"relPath":"self","isRegistryExport":false}

// [block ModuleRecipeInterface end]
//meta:ModuleRecipeInterface:[{"className":"ModuleRecipeInterface","entryNames":["recipe"]},{"disableShortie":true}]

export type ModuleRecipeInterfaceConfigKey = 'recipe';
export const ModuleRecipeInterfaceConfigKeyFirst = 'recipe';
