import Joi from 'joi';
import { LogsStorageDirSchema } from './dir/schema';

export const registryEntriesLogsStorageSchema = Joi.object({
  dir: LogsStorageDirSchema,
}).meta({ className: 'registryEntriesLogsStorageInterface' });
