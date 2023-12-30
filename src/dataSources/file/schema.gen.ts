/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

// [block DataSourceFileInterface begin]
/**
 * Loads a local file's contents and parses it using a loader, chosen based on the file's extension.
 *
 * Supported file types: `.yaml`, `.yml`, `.json`, `.js`, `.ts`
 */
export interface DataSourceFileInterface {
  /**
   * The path of the file to load
   */
  path: string;

  /**
   * The working directory to use
   */
  workDir?: string;

  /**
   * If true, do not parse the file via a loader.
   * The loaded content will be wrapped by a `content` variable.
   */
  raw?: boolean;
}
// [block DataSourceFileInterface end]
//meta:DataSourceFileInterface:[{"className":"DataSourceFileInterface","entryNames":["file"]}]

// [block DataSourceFileRawInterface begin]
/**
 * Loads a local file's contents.
 */
export interface DataSourceFileRawInterface {
  /**
   * The path of the file to load
   */
  path: string;

  /**
   * The working directory to use
   */
  workDir?: string;
}
// [block DataSourceFileRawInterface end]
//meta:DataSourceFileRawInterface:[{"className":"DataSourceFileRawInterface","entryNames":["fileRaw"]}]

export type DataSourceFileInterfaceConfigKey = 'file';
export const DataSourceFileInterfaceConfigKeyFirst = 'file';

export type DataSourceFileRawInterfaceConfigKey = 'fileRaw';
export const DataSourceFileRawInterfaceConfigKeyFirst = 'fileRaw';
