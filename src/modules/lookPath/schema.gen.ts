// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ModuleLookPathInterface begin]
/**
 * @example //disableShortie:true
 */
export type ModuleLookPathInterface =
  | string
  | {
    cmd: string;
    include?: string[];
    exclude?: string[];
  };
// [block ModuleLookPathInterface end]

export type ModuleLookPathInterfaceConfigKey = 'lookPath';
export const ModuleLookPathInterfaceConfigKeyFirst = 'lookPath';
