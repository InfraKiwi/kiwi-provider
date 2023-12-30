/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ModuleMkdirInterface begin]
export interface ModuleMkdirInterface {
  /**
   * The path of the folder to create.
   */
  path: string;

  /**
   * Whether or not to create the whole chain of missing folders needed to
   * reach the final part of the path.
   *
   * @default true
   */
  recursive?:
    | true
    | boolean;
}
// [block ModuleMkdirInterface end]
//meta:ModuleMkdirInterface:[{"className":"ModuleMkdirInterface","entryNames":["mkdir"]}]

export type ModuleMkdirInterfaceConfigKey = 'mkdir';
export const ModuleMkdirInterfaceConfigKeyFirst = 'mkdir';
