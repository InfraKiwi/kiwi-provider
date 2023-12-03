// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ModuleTestAllConditionsInterface begin]
export type ModuleTestAllConditionsInterface =
  | string
  | string[]
  | {
    [x: string]: string;
  };
// [block ModuleTestAllConditionsInterface end]

// [block ModuleTestFullInterface begin]
export interface ModuleTestFullInterface {
  tests: ModuleTestAllConditionsInterface; //typeRef:ModuleTestAllConditionsInterface:schema.gen.ts:false

  silent?: false | boolean;
}
// [block ModuleTestFullInterface end]

// [block ModuleTestInterface begin]
/**
 * @example //disableShortie:true
 */
export type ModuleTestInterface =
  | string
  | string[]
  | {
    [x: string]: string;
  }
  | ModuleTestFullInterface; //typeRef:ModuleTestFullInterface:schema.gen.ts:false

// [block ModuleTestInterface end]

// [block ModuleTestSilentFullInterface begin]
export interface ModuleTestSilentFullInterface {
  tests: ModuleTestAllConditionsInterface; //typeRef:ModuleTestAllConditionsInterface:schema.gen.ts:false
}
// [block ModuleTestSilentFullInterface end]

// [block ModuleTestSilentInterface begin]
/**
 * @example //disableShortie:true
 */
export type ModuleTestSilentInterface =
  | string
  | string[]
  | {
    [x: string]: string;
  }
  | ModuleTestSilentFullInterface; //typeRef:ModuleTestSilentFullInterface:schema.gen.ts:false

// [block ModuleTestSilentInterface end]

export type ModuleTestInterfaceConfigKey = 'test';
export const ModuleTestInterfaceConfigKeyFirst = 'test';

export type ModuleTestSilentInterfaceConfigKey = 'testSilent';
export const ModuleTestSilentInterfaceConfigKeyFirst = 'testSilent';
