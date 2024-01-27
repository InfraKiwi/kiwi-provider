/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { joiMetaClassName, joiMetaUnknownType } from '../../util/joi';
import { localhost127 } from '../../util/constants';
import type { ServerListenerInterface } from './server.schema.gen';
import { joiValidateValidIfTemplate } from '../../util/tpl';

export const ServerHooksPrefix = '10infra-config:hooks';

export const ServerListenerSchema = Joi.object({
  addr: Joi.string().hostname().default(localhost127).description('The address to listen on').optional(),
  port: Joi.number().port().description('The port to listen on').required(),
  externalUrl: Joi.string().uri(),
}).meta(joiMetaClassName('ServerListenerInterface'));

export function getServerListenerSchemaObject(defaults?: ServerListenerInterface) {
  return {
    listener: ServerListenerSchema.default({
      ...defaults,
      externalUrl: defaults?.externalUrl ?? `http://${defaults?.addr ?? localhost127}:${defaults?.port}`,
    }),
  };
}

// Only used to export the interface
export const ServerListenerWrapperSchema = Joi.object(getServerListenerSchemaObject()).meta(
  joiMetaClassName('ServerListenerWrapperInterface')
);

export const ServerHookSchema = Joi.object({
  if: Joi.string().custom(joiValidateValidIfTemplate).description(`
  The condition that will trigger the hook.
  `),
})
  .unknown(true)
  .meta(joiMetaClassName('ServerHookInterface'))
  .meta(
    joiMetaUnknownType(
      Joi.any().description(`
  The hook function config.
  You can check the available hook functions here: ##link#See all available hook functions#/hooks
  `)
    )
  );

export const ServerHookWithArraySchema = Joi.alternatives([ServerHookSchema, Joi.array().items(ServerHookSchema)]).meta(
  joiMetaClassName('ServerHookWithArrayInterface')
);
