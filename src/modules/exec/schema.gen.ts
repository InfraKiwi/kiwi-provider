/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

// [block ModuleExecInterface begin]
export type ModuleExecInterface =

  /**
   * @example
   * exec:
   *   cmd: my-bin
   *   args:
   *     - --hello
   *     - --world
   */
  | {
    /**
     * The path of the binary to execute.
     */
    cmd: string;

    /**
     * The arguments to pass to the binary.
     */
    args?: string[];

    /**
     * The working directory of the execution.
     */
    workDir?: string;

    /**
     * The id of the user under which to execute the binary.
     */
    uid?: number;

    /**
     * The id of the group under which to execute the binary.
     */
    gid?: number;

    /**
     * Any environment variables to pass to the binary.
     */
    env?: {
      [x: string]: string;
    };
  }

  /**
   * The path of the binary to execute
   *
   * @example exec: my-bin
   */
  | string

  /**
   * An array of strings where the first item is the path of the binary to
   * execute and the remaining elements are the arguments.
   *
   * @example
   * exec:
   *   - my-bin
   *   - --hello
   *   - --world
   */
  | string[];
// [block ModuleExecInterface end]
//meta:ModuleExecInterface:[{"className":"ModuleExecInterface","entryNames":["exec"]},{"disableShortie":true}]

// [block ModuleExecResultInterface begin]
/**
 * The result of the `exec` module.
 *
 * @example
 * tasks:
 * - label: Execute the binary
 *   exec:
 *     cmd: hello.exe
 *   out: execVars
 * - test: |
 *     "Hello world!" in execVars.stdout
 */
export interface ModuleExecResultInterface {
  stdout: string;
  stderr: string;
  exitCode: number;
}
// [block ModuleExecResultInterface end]
//meta:ModuleExecResultInterface:[{"className":"ModuleExecResultInterface"}]

export type ModuleExecInterfaceConfigKey = 'exec';
export const ModuleExecInterfaceConfigKeyFirst = 'exec';
