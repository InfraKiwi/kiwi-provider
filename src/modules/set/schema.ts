import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';

export const ModuleSetSchema = moduleRegistryEntryFactory.createJoiEntrySchema(__dirname, Joi.object().unknown(true));
