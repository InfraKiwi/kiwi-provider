import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';

export const ModuleLookPathSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.alternatives([
    Joi.string(),
    Joi.object({
      cmd: Joi.string().required(),
      include: Joi.array().items(Joi.string()),
      exclude: Joi.array().items(Joi.string()),
    }),
  ]),
);
