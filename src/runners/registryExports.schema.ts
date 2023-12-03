import Joi from 'joi';
import { RunnerDockerSchema } from './docker/schema';
import { RunnerLocalSchema } from './local/schema';

export const registryEntriesRunnersSchema = Joi.object({
  docker: RunnerDockerSchema,
  local: RunnerLocalSchema,
}).meta({ className: 'registryEntriesRunnersInterface' });
