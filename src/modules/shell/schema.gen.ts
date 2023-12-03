// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ModuleShellInterface begin]
/**
 * @example //disableShortie:true
 */
export type ModuleShellInterface =
  | {
    /**
     * The shell to use. Defaults to /bin/sh on UNIX platforms and process.env.ComSpec on Windows.
     */
    shell?: string;

    /**
     * The command to execute in the shell.
     */
    cmd: string;

    /**
     * The working directory of the execution.
     */
    workDir?: string;

    /**
     * The id of the user under which to execute the command.
     */
    uid?: number;

    /**
     * The id of the group under which to execute the command.
     */
    gid?: number;

    /**
     * Any environment variables to pass to the command.
     */
    env?: {
      [x: string]: string;
    };
  }

  /**
   * The command to execute in the default shell.
   */
  | string;
// [block ModuleShellInterface end]

export type ModuleShellInterfaceConfigKey = 'shell';
export const ModuleShellInterfaceConfigKeyFirst = 'shell';
