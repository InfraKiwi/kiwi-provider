/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { Express } from 'express';
import express from 'express';
import type { CommonOptions, ResponseOptions } from 'express-requests-logger';
import audit from 'express-requests-logger';
import type { ContextLogger } from '../../util/context';
import type { Logger } from 'winston';
import bodyParser from 'body-parser';
import Joi from 'joi';
import { getServerListenerSchemaObject } from './server.schema';
import type { ServerListenerInterface, ServerListenerWrapperInterface } from './server.schema.gen';

export interface NewServerArgs {
  auditRequestOptions?: CommonOptions;
  auditResponseOptions?: ResponseOptions;
}

class LoggerWrapper {
  #logger: Logger;

  constructor(logger: Logger) {
    this.#logger = logger;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(obj: object, ...params: any[]): void {
    this.#logger.info('Request', { obj });
  }
}

export function getAppConfigSchemaObject(
  appSchema: Joi.Schema,
  serverDefaults?: ServerListenerInterface
): Joi.ObjectSchema {
  return Joi.object({
    ...getServerListenerSchemaObject(serverDefaults),
    app: appSchema.default(),
  });
}

export interface AppConfigSchemaInterface<T> extends ServerListenerWrapperInterface {
  app: T;
}

export function newServer(context: ContextLogger, args: NewServerArgs): Express {
  const app = express();

  const loggerWrapper = new LoggerWrapper(context.logger);

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(
    audit({
      logger: loggerWrapper,
      request: args.auditRequestOptions,
      response: args.auditResponseOptions,
    })
  );

  return app;
}
