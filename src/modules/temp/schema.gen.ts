// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ModuleTempDirInterface begin]
export interface ModuleTempDirInterface {
  prefix?: string;
  keep?: false | boolean;
}
// [block ModuleTempDirInterface end]

// [block ModuleTempInterface begin]
export interface ModuleTempInterface {
  prefix?: string;
  extension?: string;
  keep?: false | boolean;
}
// [block ModuleTempInterface end]

export type ModuleTempInterfaceConfigKey = 'temp';
export const ModuleTempInterfaceConfigKeyFirst = 'temp';

export type ModuleTempDirInterfaceConfigKey = 'tempDir';
export const ModuleTempDirInterfaceConfigKeyFirst = 'tempDir';
