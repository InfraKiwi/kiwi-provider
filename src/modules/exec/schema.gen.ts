// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ModuleExecInterface begin]
/**
 * @example //disableShortie:true
 */
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

export type ModuleExecInterfaceConfigKey = 'exec';
export const ModuleExecInterfaceConfigKeyFirst = 'exec';
