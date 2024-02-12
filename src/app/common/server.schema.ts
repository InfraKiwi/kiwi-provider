/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { joiMetaClassName, joiMetaUnknownType } from '../../util/joi';
import { localhost127 } from '../../util/constants';
import type { ServerListenerInterface } from './server.schema.gen';
import { joiValidateValidIfTemplate } from '../../util/tpl';
import { DataSourceHTTPRawSchema } from '../../dataSources/http/schema';

export enum NotifyHealthMethod {
  'systemd-notify' = 'systemd-notify',
  http = 'http',
}

export const ServerHooksPrefix = 'kiwi-provider:hooks';

export const ServerListenerSchemaObject = {
  addr: Joi.string().hostname().default(localhost127).description('The address to listen on').optional(),
  port: Joi.number().port().optional().description('The port to listen on'),
  externalUrl: Joi.string().uri().optional(),
  health: Joi.alternatives([
    Joi.object({
      [NotifyHealthMethod['systemd-notify']]: Joi.object({}).required(),
    }).description(`
        Notify the system via systemd-notify.
        
        You can use this setting when the server is configured
        as a systemd service with type \`Type=notify\`.
      `),
    Joi.object({
      [NotifyHealthMethod.http]: DataSourceHTTPRawSchema.required(),
    }).description(`
        Sends an HTTP request as soon as the server is healthy.
      `),
  ]).description(`
      The method to use to notify the server's health.
      
      Note: the server always exposes the \`/health\` endpoint for
      pull-based health checks. The \`health\` methods are needed only
      for push-based health checks, which wait for a notification. 
    `),
};

export const ServerListenerSchema = Joi.object(ServerListenerSchemaObject).meta(
  joiMetaClassName('ServerListenerInterface')
);

export function getServerListenerSchemaObject(defaults: ServerListenerInterface = {}) {
  const adjustedDefaults: ServerListenerInterface = {
    ...defaults,
    externalUrl: defaults?.externalUrl ?? `http://${defaults?.addr ?? localhost127}:${defaults?.port}`,
  };
  const listenerWithDefaults = Object.entries(ServerListenerSchemaObject).reduce(
    (acc: Partial<Record<keyof typeof ServerListenerSchemaObject, Joi.Schema>>, [key, value]) => {
      let schema = value;
      if (key in adjustedDefaults) {
        schema = schema.default(adjustedDefaults[key as keyof ServerListenerInterface]);
      }
      acc[key as keyof ServerListenerInterface] = schema;
      return acc;
    },
    {}
  );

  return {
    listener: Joi.object(listenerWithDefaults).default(),
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
