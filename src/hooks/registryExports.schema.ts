import Joi from 'joi';
import { HookHTTPSchema } from './http/schema';

export const registryEntriesHooksSchema = Joi.object({
  http: HookHTTPSchema,
}).meta({ className: 'registryEntriesHooksInterface' });
