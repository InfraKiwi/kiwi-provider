/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunContext, RunContextShutdownHook } from '../../util/runContext';
import { ModuleHTTPListenerSchema } from './schema';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import type { ModuleHTTPListenerInterface, ModuleHTTPListenerRouteInterface } from './schema.gen';
import { newServer } from '../../app/common/server';
import { localhost127 } from '../../util/constants';
import type { Server } from 'node:http';
import type { RequestHandler, Router } from 'express';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

export interface ModuleHTTPListenerResult {
  server: Server;
  address: string;
}

export class ModuleHTTPListener extends AbstractModuleBase<ModuleHTTPListenerInterface, ModuleHTTPListenerResult> {
  async run(context: RunContext): Promise<ModuleRunResult<ModuleHTTPListenerResult>> {
    const middlewaresBeforeBodyParser: RequestHandler[] = [];
    const routers: Router[] = [];

    for (const routeKey in this.config.routes) {
      const routeVariants = this.config.routes[routeKey];
      let isBeforeBodyParser = false;
      for (const method in routeVariants) {
        const router = express.Router();
        const methodFnKey = method as keyof ModuleHTTPListenerRouteInterface;
        if (methodFnKey == 'proxy') {
          const opts = routeVariants[methodFnKey]!;
          isBeforeBodyParser = true;
          router.use(routeKey, createProxyMiddleware(opts));
        } else {
          const fn = routeVariants[methodFnKey]!;
          if (typeof fn == 'function') {
            router[methodFnKey](routeKey, fn);
          } else if ('json' in fn) {
            router[methodFnKey](routeKey, (req, res) => res.json(fn.json));
          } else if ('raw' in fn) {
            router[methodFnKey](routeKey, (req, res) => res.send(fn.raw));
          }
        }
        if (isBeforeBodyParser) {
          middlewaresBeforeBodyParser.push(router);
        } else {
          routers.push(router);
        }
      }
    }

    const app = newServer(context, {
      middlewaresBeforeBodyParser,
    });

    for (const router of routers) {
      app.use(router);
    }

    const server = await new Promise<Server>((resolve, reject) => {
      const server = app.listen(this.config.port ?? 0, this.config.addr ?? localhost127, () => {
        const address = server.address();
        context.logger.info('Server listening', { address });

        const shutdownHook: RunContextShutdownHook = {
          name: `ModuleHTTPListener server on ${JSON.stringify(address)}`,
          fn: () => ModuleHTTPListener.#shutdownServer(context, server),
        };

        context.registerShutdownHook(shutdownHook);
        resolve(server);
      });
    });

    const serverAddress = server.address()!;
    const address = typeof serverAddress == 'string' ? serverAddress : `${serverAddress.address}:${serverAddress.port}`;

    return {
      vars: {
        server,
        address,
      },
      changed: true,
    };
  }

  static async #shutdownServer(context: RunContext, server: Server) {
    const address = server.address();
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          context.logger.error('Failed to shutdown HTTP listener', {
            err,
            address,
          });
        } else {
          context.logger.debug('ModuleHTTPListener server shut down', { address });
        }
        resolve();
      });
    });
  }
}

moduleRegistryEntryFactory.register(ModuleHTTPListenerSchema, ModuleHTTPListener);
