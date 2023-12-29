/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ModuleTestAllConditionsInterface begin]
export type ModuleTestAllConditionsInterface =
  | string
  | string[]
  | {
    [x: string]: string;
  };
// [block ModuleTestAllConditionsInterface end]
//meta:ModuleTestAllConditionsInterface:[{"className":"ModuleTestAllConditionsInterface"}]

// [block ModuleTestFullInterface begin]
export interface ModuleTestFullInterface {
  tests: ModuleTestAllConditionsInterface; //typeRef:ModuleTestAllConditionsInterface:{"relPath":"self","isRegistryExport":false}

  silent?:
    | false
    | boolean;
}
// [block ModuleTestFullInterface end]
//meta:ModuleTestFullInterface:[{"className":"ModuleTestFullInterface"}]

// [block ModuleTestInterface begin]
export type ModuleTestInterface =
  | string
  | string[]
  | {
    [x: string]: string;
  }
  | ModuleTestFullInterface; //typeRef:ModuleTestFullInterface:{"relPath":"self","isRegistryExport":false}

// [block ModuleTestInterface end]
//meta:ModuleTestInterface:[{"className":"ModuleTestAllConditionsInterface"},{"className":"ModuleTestInterface","entryNames":["test"]},{"disableShortie":true}]

// [block ModuleTestSilentFullInterface begin]
export interface ModuleTestSilentFullInterface {
  tests: ModuleTestAllConditionsInterface; //typeRef:ModuleTestAllConditionsInterface:{"relPath":"self","isRegistryExport":false}

}
// [block ModuleTestSilentFullInterface end]
//meta:ModuleTestSilentFullInterface:[{"className":"ModuleTestSilentFullInterface"}]

// [block ModuleTestSilentInterface begin]
export type ModuleTestSilentInterface =
  | string
  | string[]
  | {
    [x: string]: string;
  }
  | ModuleTestSilentFullInterface; //typeRef:ModuleTestSilentFullInterface:{"relPath":"self","isRegistryExport":false}

// [block ModuleTestSilentInterface end]
//meta:ModuleTestSilentInterface:[{"className":"ModuleTestAllConditionsInterface"},{"className":"ModuleTestSilentInterface","entryNames":["testSilent"]},{"disableShortie":true}]

export type ModuleTestInterfaceConfigKey = 'test';
export const ModuleTestInterfaceConfigKeyFirst = 'test';

export type ModuleTestSilentInterfaceConfigKey = 'testSilent';
export const ModuleTestSilentInterfaceConfigKeyFirst = 'testSilent';
