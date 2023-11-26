import { newDebug } from '../../util/debug';
import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';

const debug = newDebug(__filename);

export const ModuleSetSchema = moduleRegistryEntryFactory.createJoiEntrySchema(__dirname, Joi.object().unknown(true));
