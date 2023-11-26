import { newDebug } from '../../util/debug';
import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';

const debug = newDebug(__filename);

export const ModuleEvalSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    code: Joi.string(),
    file: Joi.string(),
  }).xor('code', 'file'),
);
