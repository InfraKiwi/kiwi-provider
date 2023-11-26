import Joi from 'joi';
import { joiMetaClassName, joiValidateValidIfTemplate } from '../../util/joi';

export const ServerHooksPrefix = '10infra-config:hooks';

export const ServerListenerSchema = Joi.object({
  addr: Joi.string().hostname().default('localhost'),
  port: Joi.number().port().default(3000),
}).meta(joiMetaClassName('ServerListenerInterface'));

export interface ServerDefaults {
  port?: number;
}

export function getServerListenerSchemaObject(defaults?: ServerDefaults) {
  return {
    listener: ServerListenerSchema.default(defaults),
  };
}

// Only used to export the interface
export const ServerListenerWrapperSchema = Joi.object(getServerListenerSchemaObject()).meta(
  joiMetaClassName('ServerListenerWrapperInterface'),
);

export const ServerHookSchema = Joi.object({
  if: Joi.string().custom(joiValidateValidIfTemplate),
})
  .unknown(true)
  .meta(joiMetaClassName('ServerHookInterface'));

export const ServerHookWithArraySchema = Joi.alternatives([ServerHookSchema, Joi.array().items(ServerHookSchema)]).meta(
  joiMetaClassName('ServerHookWithArrayInterface'),
);
