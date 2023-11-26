import Joi from 'joi';
import { logsStorageRegistryEntryFactory } from '../registry';

export const LogsStorageDirSchema = logsStorageRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    path: Joi.string().required(),
  }),
);
