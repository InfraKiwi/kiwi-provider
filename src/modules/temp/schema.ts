import { newDebug } from '../../util/debug';
import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';

const debug = newDebug(__filename);

export const ModuleTempSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    prefix: Joi.string(),
    extension: Joi.string(),

    // If true, the temporary file will not be deleted on program exit
    keep: Joi.boolean().default(false).optional(),
  }),
);
