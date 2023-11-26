import Joi from 'joi';
import { joiMetaClassName } from '../../util/joi';

export const ServerWorkerConfigSchema = Joi.object({
  hostname: Joi.string(),
  serverConfigUrl: Joi.string().default('http://localhost:3000'),
  databasePath: Joi.string().default('release.db.txt'),
}).meta(joiMetaClassName('ServerWorkerConfigInterface'));
