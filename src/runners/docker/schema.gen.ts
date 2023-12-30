/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

// [block DockerInspectResultInterface begin]
export type DockerInspectResultInterface = {
  State: {
    Running: boolean;
    ExitCode: number;

    /**
     * Unknown Property
     */
    [x: string]: unknown;
  };

  /**
   * Unknown Property
   */
  [x: string]: unknown;
}[];
// [block DockerInspectResultInterface end]
//meta:DockerInspectResultInterface:[{"className":"DockerInspectResultInterface"}]

// [block RunnerDockerInterface begin]
export interface RunnerDockerInterface {
  /**
   * The name of the docker executable, could be e.g. podman.
   */
  bin?:
    | 'docker'
    | string;

  /**
   * The docker image to use in the runner. If not provided, `dockerfile` must be used.
   */
  image?: string;

  /**
   * The dockerfile configuration that will be used to build the test docker image.
   *
   * If not provided, `image` must be used.
   */
  dockerfile?: {
    /**
     * The path to the docker context. Defaults to the test suite's file folder.
     */
    context?: string;

    /**
     * If provided, uses this text as the content of the Dockerfile.
     */
    inline?: string;

    /**
     * An array of any other arguments you may want to pass to the docker `build` command.
     *
     * This list cannot contain any of the following, as they're already provided
     * by the runner's code:
     * --platform
     *
     * Ref: https://docs.docker.com/engine/reference/commandline/build/
     *
     * @example
     * args:
     * - --add-host
     * - myhost:123.123.123.123
     * - --build-arg
     * - HTTP_PROXY=http://10.20.30.2:1234
     */
    args?: string[];
  };

  /**
   * If provided, overrides the platform to be used in the docker run command.
   *
   * Defaults to the local machine's platform.
   */
  platform?:
    | 'linux/amd64'
    | 'linux/arm64'
    | 'linux/arm/v7'
    | 'windows/amd64';

  /**
   * The directory inside the container to use when uploading temporary files.
   *
   * If the default directory is mounted under a tmpfs mount, you need to specify
   * a different directory in this option. The directory must already exist in the
   * docker container.
   */
  tmpDir?:
    | '/tmp'
    | string;

  /**
   * If provided, defines which command the runner uses to block the container.
   *
   * Defaults to:
   *
   * linux:
   *   - /bin/sh
   *   - '-c'
   *   - while :; do sleep 2073600; done
   * windows:
   *   - powershell
   *   - '-Command'
   *   - while($true) { Start-Sleep -Seconds 2073600; }
   */
  sleepCommand?:

    /**
     * When `sleepCommand` is false, the runner will not use any command to
     * start the container, defaulting to the container's own CMD. This is useful
     * when the container already comes with a ENTRYPOINT/CMD that never exits, like
     * a webserver that start listening for connections.
     */
    | false

    /**
     * A command/args array.
     */
    | string[];

  /**
   * An array of any other arguments you may want to pass to the docker `run` command.
   *
   * This list cannot contain any of the following, as they're already provided
   * by the runner's code:
   * --platform
   * --detach [-d]
   * --tty [-t]
   *
   * Ref: https://docs.docker.com/engine/reference/commandline/run/
   *
   * @example
   * runArgs:
   * - --privileged
   * - --workdir
   * - /mydir
   */
  runArgs?: string[];
}
// [block RunnerDockerInterface end]
//meta:RunnerDockerInterface:[{"className":"RunnerDockerInterface","entryNames":["docker"]}]

export type RunnerDockerInterfaceConfigKey = 'docker';
export const RunnerDockerInterfaceConfigKeyFirst = 'docker';
