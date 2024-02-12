/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

// [block ModuleLookPathInterface begin]
export type ModuleLookPathInterface =
  | string
  | {
    cmd: string;
    include?: string[];
    exclude?: string[];
  };
// [block ModuleLookPathInterface end]
//meta:ModuleLookPathInterface:[{"className":"ModuleLookPathInterface","entryNames":["lookPath"]},{"disableShortie":true}]

export type ModuleLookPathInterfaceConfigKey = 'lookPath';
export const ModuleLookPathInterfaceConfigKeyFirst = 'lookPath';
