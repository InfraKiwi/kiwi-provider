// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ModuleRecipeFullInterface begin]
export interface ModuleRecipeFullInterface {
  version?: string;
  sourceId?: string;
  id: string;
}
// [block ModuleRecipeFullInterface end]

// [block ModuleRecipeInterface begin]
/**
 * @example //disableShortie:true
 */
export type ModuleRecipeInterface = string | ModuleRecipeFullInterface; //typeRef:ModuleRecipeFullInterface:schema.gen.ts:false

// [block ModuleRecipeInterface end]

export type ModuleRecipeInterfaceConfigKey = 'recipe';
export const ModuleRecipeInterfaceConfigKeyFirst = 'recipe';
