/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

// [block ModuleExitFullInterface begin]
export interface ModuleExitFullInterface {
  message?: string;
}
// [block ModuleExitFullInterface end]
//meta:ModuleExitFullInterface:[{"className":"ModuleExitFullInterface"}]

// [block ModuleExitInterface begin]
export type ModuleExitInterface =
  | string
  | ModuleExitFullInterface; //typeRef:ModuleExitFullInterface:{"relPath":"self","isRegistryExport":false}

// [block ModuleExitInterface end]
//meta:ModuleExitInterface:[{"className":"ModuleExitInterface","entryNames":["exit"]},{"disableShortie":true}]

export type ModuleExitInterfaceConfigKey = 'exit';
export const ModuleExitInterfaceConfigKeyFirst = 'exit';
