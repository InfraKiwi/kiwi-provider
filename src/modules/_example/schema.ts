import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';

export const ModuleExampleSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    hello: Joi.string().required(),
  }),
);
