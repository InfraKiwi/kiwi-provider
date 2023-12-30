/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ModuleTempDirInterface begin]
export interface ModuleTempDirInterface {
  prefix?: string;
  keep?:
    | false
    | boolean;
}
// [block ModuleTempDirInterface end]
//meta:ModuleTempDirInterface:[{"className":"ModuleTempDirInterface","entryNames":["tempDir"]}]

// [block ModuleTempInterface begin]
export interface ModuleTempInterface {
  prefix?: string;
  extension?: string;
  keep?:
    | false
    | boolean;
}
// [block ModuleTempInterface end]
//meta:ModuleTempInterface:[{"className":"ModuleTempInterface","entryNames":["temp"]}]

export type ModuleTempInterfaceConfigKey = 'temp';
export const ModuleTempInterfaceConfigKeyFirst = 'temp';

export type ModuleTempDirInterfaceConfigKey = 'tempDir';
export const ModuleTempDirInterfaceConfigKeyFirst = 'tempDir';
