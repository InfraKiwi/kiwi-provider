/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ModuleShellInterface begin]
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
//meta:ModuleShellInterface:[{"className":"ModuleShellInterface","entryNames":["shell"]},{"disableShortie":true}]

export type ModuleShellInterfaceConfigKey = 'shell';
export const ModuleShellInterfaceConfigKeyFirst = 'shell';
