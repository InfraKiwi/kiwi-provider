import Joi from 'joi';
import { runnerRegistryEntryFactory } from '../registry';
import { getJoiEnumValues } from '../../util/joi';

export enum RunnerDockerSupportedPlatforms {
  'linux/amd64' = 'linux/amd64',
  'linux/arm64' = 'linux/arm64',
  'linux/arm/v7' = 'linux/arm/v7',
  'windows/amd64' = 'windows/amd64',
}

export const RunnerDockerBinaryDefault = 'docker';

export const RunnerDockerSchema = runnerRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    // The name of the docker executable, could be e.g. podman
    bin: Joi.string().default(RunnerDockerBinaryDefault).optional(),

    // The base image to use in the runner
    image: Joi.string().required(),

    // If provided, overrides the platform to be used in the docker run command
    platform: getJoiEnumValues(RunnerDockerSupportedPlatforms),

    // If provided, overrides which command the runner uses to block the container
    waitCommand: Joi.array().items(Joi.string()).min(1),
  }),
);

export interface DockerInspectResult {
  Platform: 'linux' | 'windows';
}

export type DockerInspectPlatform = DockerInspectResult['Platform'];
