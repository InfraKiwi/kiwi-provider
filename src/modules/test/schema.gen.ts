/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

import type { RunContextPublicVarsInterface } from '../../util/runContext.schema.gen';

// [block ModuleTestAllConditionsInterface begin]
export type ModuleTestAllConditionsInterface =
  | (
    | string
    | TestFunctionInterface) //typeRef:TestFunctionInterface:{"relPath":"self","isRegistryExport":false}
    | ((
      | string
      | TestFunctionInterface)[]) //typeRef:TestFunctionInterface:{"relPath":"self","isRegistryExport":false}
      | ({
  [x: string]:
    | string
    | TestFunctionInterface; //typeRef:TestFunctionInterface:{"relPath":"self","isRegistryExport":false}
});
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
  | (
    | string
    | TestFunctionInterface) //typeRef:TestFunctionInterface:{"relPath":"self","isRegistryExport":false}
    | ((
      | string
      | TestFunctionInterface)[]) //typeRef:TestFunctionInterface:{"relPath":"self","isRegistryExport":false}
      | ({
  [x: string]:
    | string
    | TestFunctionInterface; //typeRef:TestFunctionInterface:{"relPath":"self","isRegistryExport":false}
})
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
  | (
    | string
    | TestFunctionInterface) //typeRef:TestFunctionInterface:{"relPath":"self","isRegistryExport":false}
    | ((
      | string
      | TestFunctionInterface)[]) //typeRef:TestFunctionInterface:{"relPath":"self","isRegistryExport":false}
      | ({
  [x: string]:
    | string
    | TestFunctionInterface; //typeRef:TestFunctionInterface:{"relPath":"self","isRegistryExport":false}
})
| ModuleTestSilentFullInterface; //typeRef:ModuleTestSilentFullInterface:{"relPath":"self","isRegistryExport":false}

// [block ModuleTestSilentInterface end]
//meta:ModuleTestSilentInterface:[{"className":"ModuleTestAllConditionsInterface"},{"className":"ModuleTestSilentInterface","entryNames":["testSilent"]},{"disableShortie":true}]

// [block TestFunctionInterface begin]
export type TestFunctionInterface = ((context: RunContextPublicVarsInterface) => boolean | Promise<boolean>); //typeRef:RunContextPublicVarsInterface:{"relPath":"../../util/runContext.schema.gen.ts","isRegistryExport":false}

// [block TestFunctionInterface end]
//meta:TestFunctionInterface:[{"baseType":"((context: RunContextPublicVarsInterface) => boolean | Promise<boolean>)"},{"className":"TestFunctionInterface"}]

export type ModuleTestInterfaceConfigKey = 'test';
export const ModuleTestInterfaceConfigKeyFirst = 'test';

export type ModuleTestSilentInterfaceConfigKey = 'testSilent';
export const ModuleTestSilentInterfaceConfigKeyFirst = 'testSilent';
