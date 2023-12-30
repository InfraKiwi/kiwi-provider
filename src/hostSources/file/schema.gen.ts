/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

// [block HostSourceFileInterface begin]
export interface HostSourceFileInterface {
  /**
   * The path of the file to load
   */
  path: string;

  /**
   * The working directory to use
   */
  workDir?: string;
}
// [block HostSourceFileInterface end]
//meta:HostSourceFileInterface:[{"className":"HostSourceFileInterface","entryNames":["file"]}]

export type HostSourceFileInterfaceConfigKey = 'file';
export const HostSourceFileInterfaceConfigKeyFirst = 'file';
