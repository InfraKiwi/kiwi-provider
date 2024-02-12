/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

// [block ModuleStatFullInterface begin]
export interface ModuleStatFullInterface {
  path: string;
  follow?:
    | false
    | boolean;
  throw?:
    | false
    | boolean;
}
// [block ModuleStatFullInterface end]
//meta:ModuleStatFullInterface:[{"className":"ModuleStatFullInterface"}]

// [block ModuleStatInterface begin]
export interface ModuleStatInterface {
  path: string;
  follow?:
    | false
    | boolean;
  throw?:
    | false
    | boolean;
}
// [block ModuleStatInterface end]
//meta:ModuleStatInterface:[{"className":"ModuleStatFullInterface"},{"className":"ModuleStatInterface","entryNames":["stat"]}]

export type ModuleStatInterfaceConfigKey = 'stat';
export const ModuleStatInterfaceConfigKeyFirst = 'stat';
