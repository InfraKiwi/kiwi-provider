import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';

export const ModuleShellSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.alternatives([
    Joi.object({
      cmd: Joi.string().min(1).required(),
      workDir: Joi.string(),
    }),
    Joi.string().min(1).required(),
  ]),
);
