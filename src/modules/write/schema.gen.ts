/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

// [block ModuleWriteInterface begin]
export interface ModuleWriteInterface {
  /**
   * The path of the file.
   */
  path: string;

  /**
   * The working directory to use as reference.
   */
  workDir?: string;

  /**
   * When `raw` is undefined or `false`, then `content` will be serialized
   * using the file extension as a hint.
   * Supported extensions are: `.yaml`, `.yml`, `.json`
   *
   * If true, do not auto-convert the contents to fit the file type.
   * In this case, `content` must forcefully be a string already.
   */
  raw?:
    | false
    | boolean;

  /**
   * Any kind of content.
   *
   * If `raw` is `false`, then `content` needs to be a `string`.
   */
  content: any;
}
// [block ModuleWriteInterface end]
//meta:ModuleWriteInterface:[{"className":"ModuleWriteInterface","entryNames":["write"]}]

// [block ModuleWriteRawInterface begin]
export interface ModuleWriteRawInterface {
  /**
   * The path of the file.
   */
  path: string;

  /**
   * The working directory to use as reference.
   */
  workDir?: string;

  /**
   * Any kind of content.
   *
   * If `raw` is `false`, then `content` needs to be a `string`.
   */
  content: any;
}
// [block ModuleWriteRawInterface end]
//meta:ModuleWriteRawInterface:[{"className":"ModuleWriteRawInterface","entryNames":["writeRaw"]}]

export type ModuleWriteInterfaceConfigKey = 'write';
export const ModuleWriteInterfaceConfigKeyFirst = 'write';

export type ModuleWriteRawInterfaceConfigKey = 'writeRaw';
export const ModuleWriteRawInterfaceConfigKeyFirst = 'writeRaw';
