// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ModuleFailFullInterface begin]
export interface ModuleFailFullInterface {
  message?: string;
}
// [block ModuleFailFullInterface end]

// [block ModuleFailInterface begin]
/**
 * @example //disableShortie:true
 */
export type ModuleFailInterface = string | ModuleFailFullInterface; //typeRef:ModuleFailFullInterface:schema.gen.ts:false

// [block ModuleFailInterface end]

export type ModuleFailInterfaceConfigKey = 'fail';
export const ModuleFailInterfaceConfigKeyFirst = 'fail';
