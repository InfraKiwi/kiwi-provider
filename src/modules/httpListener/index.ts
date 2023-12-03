import type { RunContext } from '../../util/runContext';
import { ModuleHTTPListenerSchema } from './schema';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import type { ModuleHTTPListenerInterface, ModuleHTTPListenerRouteInterface } from './schema.gen';
import { newServer } from '../../app/common/server';
import { localhost127 } from '../../util/constants';
import type { Server } from 'node:http';

export interface ModuleHTTPListenerResult {
  server: Server;
  address: string;
}

export class ModuleHTTPListener extends AbstractModuleBase<ModuleHTTPListenerInterface, ModuleHTTPListenerResult> {
  async run(context: RunContext): Promise<ModuleRunResult<ModuleHTTPListenerResult>> {
    const app = newServer(context, {});

    for (const routeKey in this.config.routes) {
      const group = app.route(routeKey);
      const routeVariants = this.config.routes[routeKey];
      for (const method in routeVariants) {
        const methodFnKey = method as keyof ModuleHTTPListenerRouteInterface;
        const fn = routeVariants[methodFnKey]!;
        if (typeof fn == 'function') {
          group[methodFnKey](fn);
        } else if ('json' in fn) {
          group[methodFnKey]((req, res) => res.json(fn.json));
        } else if ('raw' in fn) {
          group[methodFnKey]((req, res) => res.send(fn.raw));
        }
      }
    }

    const server = await new Promise<Server>((resolve, reject) => {
      const server = app.listen(this.config.port ?? 0, this.config.addr ?? localhost127, () => {
        const address = server.address();
        context.logger.info(`Server listening`, { address });
        context.registerShutdownHook({
          label: `ModuleHTTPListener server on ${JSON.stringify(address)}`,
          fn: () => ModuleHTTPListener.#shutdownServer(context, server),
        });
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
          context.logger.error(`Failed to shutdown HTTP listener`, {
            err,
            address,
          });
        } else {
          context.logger.debug(`ModuleHTTPListener server shut down`, { address });
        }
        resolve();
      });
    });
  }
}

moduleRegistryEntryFactory.register(ModuleHTTPListenerSchema, ModuleHTTPListener);
