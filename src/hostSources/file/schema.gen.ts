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

export type HostSourceFileInterfaceConfigKey = 'file';
export const HostSourceFileInterfaceConfigKeyFirst = 'file';
