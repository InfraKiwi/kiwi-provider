/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { runnerRegistryEntryFactory } from '../registry';
import { getJoiEnumValues, joiMetaClassName } from '../../util/joi';
import { dumpYAML } from '../../util/yaml';

export enum RunnerDockerSupportedPlatforms {
  'linux/amd64' = 'linux/amd64',
  'linux/arm64' = 'linux/arm64',
  'linux/arm/v7' = 'linux/arm/v7',
  'windows/amd64' = 'windows/amd64',
}

export interface DockerInspectResult {
  Platform: 'linux' | 'windows';
}

export type DockerInspectPlatform = DockerInspectResult['Platform'];

export const DockerRunnerTmpDirDefault = '/tmp';

export const RunnerDockerSleepCommands: { [k in DockerInspectPlatform]: string[] } = {
  linux: ['/bin/sh', '-c', 'while :; do sleep 2073600; done'],
  windows: ['powershell', '-Command', 'while($true) { Start-Sleep -Seconds 2073600; }'],
};

export const RunnerDockerBinaryDefault = 'docker';
export const RunnerDockerReadyTimeoutDefault = 60000;
export const RunnerDockerReadyIntervalDefault = 1000;

export const DockerInspectResultSchema = Joi.array()
  .items(
    Joi.object({
      State: Joi.object({
        Running: Joi.boolean().required(),
        ExitCode: Joi.number().required(),
      })
        .unknown(true)
        .required(),
    }).unknown(true)
  )
  .length(1)
  .meta(joiMetaClassName('DockerInspectResultInterface'));

export const RunnerDockerSchema = runnerRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    bin: Joi.string().default(RunnerDockerBinaryDefault).optional().description(`
       The name of the docker executable, could be e.g. podman.
    `),

    image: Joi.string().description(`
      The docker image to use in the runner. If not provided, \`dockerfile\` must be used.
    `),

    dockerfile: Joi.object({
      context: Joi.string().description(`The path to the docker context. Defaults to the test suite's file folder.`),
      inline: Joi.string().description(`
        If provided, uses this text as the content of the Dockerfile.
      `),
      args: Joi.array().items(Joi.string().invalid('--platform')).description(`
      An array of any other arguments you may want to pass to the docker \`build\` command.
      
      This list cannot contain any of the following, as they're already provided
      by the runner's code:
      --platform
      
      Ref: https://docs.docker.com/engine/reference/commandline/build/
    `).example(`
      args:
      - --add-host
      - myhost:123.123.123.123
      - --build-arg
      - HTTP_PROXY=http://10.20.30.2:1234
    `),
    }).description(`
      The dockerfile configuration that will be used to build the test docker image.
      
      If not provided, \`image\` must be used.
    `),

    platform: getJoiEnumValues(RunnerDockerSupportedPlatforms).description(`
      If provided, overrides the platform to be used in the docker run command.
      
      Defaults to the local machine's platform.
    `),

    tmpDir: Joi.string().default(DockerRunnerTmpDirDefault).optional().description(`
      The directory inside the container to use when uploading temporary files.
      
      If the default directory is mounted under a tmpfs mount, you need to specify
      a different directory in this option. The directory must already exist in the
      docker container.
    `),

    ready: Joi.object({
      command: Joi.array().items(Joi.string()).min(1).required().description(`
        The command/args array to use to check if the Docker container is ready
        to accept commands.
      `),
      timeout: Joi.number().integer().min(1).default(RunnerDockerReadyTimeoutDefault).optional().description(`
        How many milliseconds to wait before declaring the runner invalid.
        When the timeout expires, the test suite execution will fail.
      `),
      interval: Joi.number().integer().min(1).default(RunnerDockerReadyIntervalDefault).optional().description(`
        How frequently, in milliseconds, to check for the runner readiness
        using the \`ready.command\` command.
      `),
    }).description(`
      If provided, defines a command the runner uses to verify the Docker container
      has started and is ready to accept commands.
    `),

    sleepCommand: Joi.alternatives([
      Joi.boolean().valid(false).description(`
        When \`sleepCommand\` is false, the runner will not use any command to 
        start the container, defaulting to the container's own CMD. This is useful
        when the container already comes with a ENTRYPOINT/CMD that never exits, like
        a webserver that start listening for connections.
      `),
      Joi.array().items(Joi.string()).min(1).description(`
        A command/args array.
      `),
    ]).description(`
      If provided, defines which command the runner uses to block the container.
      
      Defaults to:
      
      ${dumpYAML(RunnerDockerSleepCommands)}
    `),

    runArgs: Joi.array().items(Joi.string().invalid('--platform', '--detach', '-d')).description(`
      An array of any other arguments you may want to pass to the docker \`run\` command.
      
      This list cannot contain any of the following, as they're already provided
      by the runner's code:
      --platform
      --detach [-d]
      --tty [-t]
      
      Ref: https://docs.docker.com/engine/reference/commandline/run/
    `).example(`
      runArgs:
      - --privileged
      - --workdir
      - /mydir
    `),
  }).xor('image', 'dockerfile')
);
