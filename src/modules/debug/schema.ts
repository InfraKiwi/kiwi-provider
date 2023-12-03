import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';

export const ModuleDebugSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.any().description(`Any value type is acceptable, as it will be encoded and printed to the console`),
);
