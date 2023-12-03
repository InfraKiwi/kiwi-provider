import Joi from 'joi';
import { HostSourceFileSchema } from './file/schema';
import { HostSourceGlobSchema } from './glob/schema';
import { HostSourceHTTPSchema } from './http/schema';
import { HostSourceRawSchema } from './raw/schema';

export const registryEntriesHostSourcesSchema = Joi.object({
  file: HostSourceFileSchema,
  glob: HostSourceGlobSchema,
  http: HostSourceHTTPSchema,
  raw: HostSourceRawSchema,
}).meta({ className: 'registryEntriesHostSourcesInterface' });
