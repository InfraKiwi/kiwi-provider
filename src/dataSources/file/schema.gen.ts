// Generated with: yarn gen -> cmd/schemaGen.ts

// [block DataSourceFileInterface begin]
/**
 * Loads a local file's contents and parses it using a loader, chosen based on the file's extension.
 *
 * Supported file types: `.yaml`, `.yml`, `.json`
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

export type DataSourceFileInterfaceConfigKey = 'file';
export const DataSourceFileInterfaceConfigKeyFirst = 'file';

export type DataSourceFileRawInterfaceConfigKey = 'fileRaw';
export const DataSourceFileRawInterfaceConfigKeyFirst = 'fileRaw';
