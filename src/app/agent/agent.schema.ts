import Joi from 'joi';
import { joiMetaClassName } from '../../util/joi';
import { localhost127 } from '../../util/constants';
import { ConfigProviderListenerDefaultPort } from '../configProvider/configProvider.schema';
export const AgentListenerDefaultPort = 13901;

export const AgentConfigSchema = Joi.object({
  hostname: Joi.string().description(`The id/hostname of the current machine`),
  configProviderUrl: Joi.string().default(`http://${localhost127}:${ConfigProviderListenerDefaultPort}`),
  databasePath: Joi.string().default('release.db.txt'),
}).meta(joiMetaClassName('AgentConfigInterface'));
