import Joi from 'joi';
import { joiMetaClassName } from '../../util/joi';

export const AgentBootstrapConfigParseArgsOptions: ParseArgsOptionsConfig = {
  url: { type: 'string' },
  installDir: { type: 'string' },
  force: { type: 'boolean' },
};

export const AgentBootstrapConfigSchema = Joi.object({
  url: Joi.string().uri().required(),
  installDir: Joi.string().required(),
  force: Joi.boolean().description(`If true, forcefully overwrite any existing agent config.`),
}).meta(joiMetaClassName('AgentBootstrapConfigInterface'));
