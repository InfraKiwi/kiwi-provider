/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ModuleFailFullInterface begin]
export interface ModuleFailFullInterface {
  message?: string;
}
// [block ModuleFailFullInterface end]
//meta:ModuleFailFullInterface:[{"className":"ModuleFailFullInterface"}]

// [block ModuleFailInterface begin]
export type ModuleFailInterface =
  | string
  | ModuleFailFullInterface; //typeRef:ModuleFailFullInterface:{"relPath":"self","isRegistryExport":false}

// [block ModuleFailInterface end]
//meta:ModuleFailInterface:[{"className":"ModuleFailInterface","entryNames":["fail"]},{"disableShortie":true}]

export type ModuleFailInterfaceConfigKey = 'fail';
export const ModuleFailInterfaceConfigKeyFirst = 'fail';
