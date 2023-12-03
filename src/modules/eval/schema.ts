import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';

export const ModuleEvalSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    code: Joi.string(),
    file: Joi.string(),
  }).xor('code', 'file'),
);
