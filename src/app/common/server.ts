/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { Express, RequestHandler } from 'express';
import express from 'express';
import type { CommonOptions, ResponseOptions } from 'express-requests-logger';
import audit from 'express-requests-logger';
import type { ContextLogger } from '../../util/context';
import type { Logger } from 'winston';
import bodyParser from 'body-parser';
import Joi from 'joi';
import { getServerListenerSchemaObject } from './server.schema';
import type { ServerListenerInterface, ServerListenerWrapperInterface } from './server.schema.gen';
import { localhost127 } from '../../util/constants';
import type { Server } from 'node:http';
import { getRoutes } from '../../util/expressRoutes';
import { getBuildVersion } from '../../util/package';
import { lookpath } from 'lookpath';
import { execCmd } from '../../util/exec';

const NOTIFY_HEALTH_METHOD_ENV_VAR = 'NOTIFY_HEALTH_METHOD';

enum NotifyHealthMethod {
  'systemd-notify' = 'systemd-notify',
}

export interface NewServerArgs {
  auditRequestOptions?: CommonOptions;
  auditResponseOptions?: ResponseOptions;
  middlewaresBeforeBodyParser?: RequestHandler[];
  skipDefaultMiddlewares?: boolean;
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

  for (const mw of args.middlewaresBeforeBodyParser ?? []) {
    app.use(mw);
  }

  if (args.skipDefaultMiddlewares) {
    return app;
  }

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  const loggerWrapper = new LoggerWrapper(context.logger);

  app.use(
    audit({
      logger: loggerWrapper,
      request: args.auditRequestOptions,
      response: args.auditResponseOptions,
    })
  );

  app.use((req, res, next) => {
    // Only log json responses
    next();

    if ((res.getHeader('Content-Type') as string)?.includes('application/json') != true) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any).skipLogResponse = true;
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.use('/version', async (req, res) => {
    res.status(200).json(await getBuildVersion(context));
  });

  return app;
}

async function notifyHealthySystemDNotify(context: ContextLogger) {
  if ((await lookpath('systemd-notify')) == null) {
    throw new Error(`systemd-notify executable not found`);
  }

  const args: string[] = ['--ready', `--pid=${process.pid}`];
  context.logger.info(`Notifying health with method ${NotifyHealthMethod['systemd-notify']}`, { args });

  await execCmd(context, 'systemd-notify', args, {
    logVerbose: true,
    streamLogs: true,
  });
}

async function notifyHealthy(context: ContextLogger) {
  const method = process.env[NOTIFY_HEALTH_METHOD_ENV_VAR];
  if (method == null) {
    return;
  }

  switch (method as NotifyHealthMethod) {
    case NotifyHealthMethod['systemd-notify']:
      await notifyHealthySystemDNotify(context);
      return;
    default:
      throw new Error(`Unsupported NotifyHealthMethod ${method}`);
  }
}

export function appListen(context: ContextLogger, app: Express, config: ServerListenerInterface): Server {
  const server = app.listen(config.port, config.addr ?? localhost127, () => {
    context.logger.info('Server listening', { address: server.address() });
    getRoutes(app).forEach((route) => context.logger.info(`${route}`));

    notifyHealthy(context).catch((ex) => context.logger.error('Failed to notify healthy server', ex));
  });
  return server;
}
