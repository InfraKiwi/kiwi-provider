/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
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
import { getServerListenerSchemaObject, NotifyHealthMethod } from './server.schema';
import type { ServerListenerInterface, ServerListenerWrapperInterface } from './server.schema.gen';
import { localhost127 } from '../../util/constants';
import type { Server } from 'node:http';
import { getRoutes } from '../../util/expressRoutes';
import { getBuildVersion } from '../../util/package';
import { lookpath } from 'lookpath';
import { execCmd } from '../../util/exec';
import { inspect } from '../../util/inspect';
import type { DataSourceHTTPRawInterface } from '../../dataSources/http/schema.gen';
import { DataSourceHTTP } from '../../dataSources/http';
import { getErrorCauseChain } from '../../util/error';

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

  app.use('/health', (req, res) => {
    res.status(200).send('Ok');
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

async function notifyHealthyHTTP(context: ContextLogger, http: DataSourceHTTPRawInterface) {
  context.logger.info(`Notifying health with method ${NotifyHealthMethod.http}`, { http });
  await new DataSourceHTTP(http).load(context);
}

async function notifyHealthy(context: ContextLogger, health: NonNullable<ServerListenerInterface['health']>) {
  if (NotifyHealthMethod['systemd-notify'] in health) {
    await notifyHealthySystemDNotify(context);
  } else if (NotifyHealthMethod.http in health) {
    await notifyHealthyHTTP(context, health.http);
  } else {
    throw new Error(`Unsupported listener health configuration: ${inspect(health)}`);
  }
}

export async function appListen(
  context: ContextLogger,
  app: Express,
  config: ServerListenerInterface
): Promise<Server> {
  // Add the catch-all error handler
  app.use(function errorHandler(err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
    res.status(500);
    res.json({ error: getErrorCauseChain(err) });
  });

  let server: Server;
  return new Promise((res, rej) => {
    server = app.listen(config.port ?? 0, config.addr ?? localhost127, () => {
      context.logger.info('Server listening', { address: server.address() });
      getRoutes(app).forEach((route) => context.logger.info(`${route}`));

      if (config.health) {
        notifyHealthy(context, config.health).catch((ex) =>
          context.logger.error('Failed to notify healthy server', ex)
        );
      }

      res(server);
    });
  });
}
