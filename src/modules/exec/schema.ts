import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';

export const ModuleExecSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.alternatives([
    Joi.object({
      cmd: Joi.string().min(1).required(),
      args: Joi.array().items(Joi.string()),
      workDir: Joi.string(),
    }),
    Joi.string().min(1),
    Joi.array().items(Joi.string()).min(1),
  ]),
);
