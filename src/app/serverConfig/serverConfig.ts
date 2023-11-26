import type { Express, Request } from 'express';
import express from 'express';
import { compileArchiveForHost } from '../../commands/compileArchiveForHost';
import type { Logger } from 'winston';
import { loadYAML } from '../../util/yaml';
import { fsPromiseReadFile } from '../../util/fs';
import { tryOrThrow, tryOrThrowAsync } from '../../util/try';
import { Inventory } from '../../components/inventory';
import type { InventoryInterface } from '../../components/inventory.schema.gen';
import type { DataSourceContext } from '../../dataSources/abstractDataSource';
import { Archive } from '../../components/archive';
import type {
  ServerConfigConfigInterface,
  ServerConfigHooksInterface,
  ServerConfigHooksKeysInterface,
  ServerConfigRouteGetConfigForHostnameResultInterface,
} from './serverConfig.schema.gen';
import {
  AssetsDistributionSchema,
  LogsStorageSchema,
  ServerConfigConfigSchema,
  ServerConfigHeaderHostname,
  ServerConfigHooksKeysSchema,
} from './serverConfig.schema';
import Joi from 'joi';
import { PrismaClient } from '@prisma/client';
import { HostReportRequestSchema } from '../common/models.schema';
import type { HostReportRequestInterface } from '../common/models.schema.gen';
import { assetsDistributionRegistry } from '../../assetsDistribution/registry';
import type { AbstractAssetsDistributionInstance } from '../../assetsDistribution/abstractAssetsDistribution';
import { AbstractAssetsDistribution } from '../../assetsDistribution/abstractAssetsDistribution';
import { logsStorageRegistry } from '../../logsStorage/registry';
import type { AbstractLogsStorageInstance, LogsStorageContext } from '../../logsStorage/abstractLogsStorage';
import { AbstractLogsStorage } from '../../logsStorage/abstractLogsStorage';
import { LogsStorageRoutesMountPrefix } from '../../logsStorage/abstractLogsStorage.schema';
import { mountRoutesUI } from './routesUI';

import '../../util/loadAllRegistryEntries.serverConfig.gen';
import { extractAllTemplates, IfTemplate, resolveTemplates } from '../../util/tpl';
import type { ServerHookInterface } from '../common/server.schema.gen';
import type { AbstractNotifierInstance } from '../../notifiers/abstractNotifier';
import { notifierRegistry } from '../../notifiers/registry';
import { ServerHookSchema } from '../common/server.schema';

interface PreloadedHooks {
  config: ServerHookInterface;
  instance: AbstractNotifierInstance;
}

export class ServerConfig {
  readonly #config: ServerConfigConfigInterface;
  readonly #logger: Logger;
  readonly #client: PrismaClient;
  readonly #assetsDistribution: AbstractAssetsDistributionInstance;
  readonly #logsStorage: AbstractLogsStorageInstance;
  readonly #context: DataSourceContext;
  readonly #hooks: { [key in keyof ServerConfigHooksInterface]: PreloadedHooks[] } = {};

  constructor(logger: Logger, config: ServerConfigConfigInterface) {
    this.#config = Joi.attempt(config, ServerConfigConfigSchema, 'Failed to validate serverConfig config: ');
    this.#logger = logger.child({ server: 'config' });
    this.#client = new PrismaClient();
    this.#context = {
      logger: this.#logger,
      workDir: this.#config.workDir,
    };

    this.#assetsDistribution =
      assetsDistributionRegistry.getRegistryEntryInstanceFromIndexedConfig<AbstractAssetsDistributionInstance>(
        this.#config.assetsDistribution,
        AssetsDistributionSchema,
      );

    this.#logsStorage = logsStorageRegistry.getRegistryEntryInstanceFromIndexedConfig<AbstractLogsStorageInstance>(
      this.#config.logsStorage,
      LogsStorageSchema,
    );
  }

  get release(): string {
    return `release-${this.#archive.config.timestamp}`;
  }

  #inventory!: Inventory;
  #archive!: Archive;

  async initialize(): Promise<void> {
    // Perform all needed checks and load our static config
    {
      const data = loadYAML(await fsPromiseReadFile(this.#config.inventoryPath, 'utf8'));
      const inventory = tryOrThrow(
        () => new Inventory(data as InventoryInterface),
        `Failed to load inventory ${this.#config.inventoryPath}`,
      );
      await tryOrThrowAsync(() => inventory.loadGroupsAndStubs(this.#context), `Failed to load inventory host stubs`);
      this.#inventory = inventory;
    }

    this.#archive = await Archive.fromDir(this.#config.archivePath);
  }

  mountRoutes(app: Express) {
    const routesForAdminGroup = express.Router();
    {
      // TODO auth?

      mountRoutesUI({ ...this.#context, client: this.#client }, routesForAdminGroup);

      // routesForAdminGroup.get('/report', async (req, res) => {
      //   // Dump all reports
      //   const reports = await this.#client.hostReport.findMany({
      //     orderBy: {
      //       timestamp: 'desc',
      //     },
      //     include: {
      //       logs: true,
      //     },
      //   });
      //   res.send(reports);
      // });
    }

    const routesForHostGroup = express.Router();
    {
      // Auth
      routesForHostGroup.use((req, res, next) => {
        const hostname = (req.query['hostname'] as string) ?? req.header(ServerConfigHeaderHostname);
        if (hostname == null) {
          throw new Error('Missing requester hostname');
        }
        req.clientHostname = hostname;
        next();
      });

      routesForHostGroup.get('/release', (req, res) => {
        res.status(200).json({
          release: this.release,
        });
      });

      {
        const assetsDistributionRouter = express.Router();
        AbstractAssetsDistribution.mountStaticRoutes(this.#context, assetsDistributionRouter, this.#assetsDistribution);
        this.#assetsDistribution.mountRoutes(this.#context, assetsDistributionRouter);
        routesForHostGroup.use('/assetsDistribution', assetsDistributionRouter);
      }

      routesForHostGroup.get('/config/:release', async (req: Request, res) => {
        const hostname = req.clientHostname!;
        const release = req.params.release;

        if (release != this.release && release != 'latest') {
          throw new Error(`Release mismatch, requested ${release} but available ${this.release}`);
        }

        const compileResult = await compileArchiveForHost(this.#context, {
          hostname,
          inventory: this.#inventory,
          archive: this.#archive,
        });

        const result: ServerConfigRouteGetConfigForHostnameResultInterface = {
          compileResult,
        };

        res.status(200).json(result);
      });

      routesForHostGroup.post('/report', async (req, res) => {
        const data = Joi.attempt(req.body, HostReportRequestSchema) as HostReportRequestInterface;
        if (data.hostname != req.clientHostname) {
          throw new Error(`Mismatching hostname`);
        }

        const fixedData = {
          ...data,
          timestamp: new Date(data.timestamp),
        };
        const result = await this.#client.hostReport.upsert({
          where: {
            hostname_release_type_key: {
              hostname: fixedData.hostname,
              release: fixedData.release,
              type: fixedData.type,
              key: fixedData.key,
            },
          },
          create: fixedData,
          update: fixedData,
        });

        this.#logger.info('Report received', { fixedData });

        await this.#processHook(this.#context, 'report', result);

        res.sendStatus(200);
      });
    }

    {
      const logsStorageContext: LogsStorageContext = {
        ...this.#context,
        client: this.#client,
      };
      const logsStorageRouterForHost = express.Router();
      const logsStorageRouterForAdmin = express.Router();
      AbstractLogsStorage.mountStaticRoutes(
        logsStorageContext,
        this.#logsStorage,
        logsStorageRouterForHost,
        logsStorageRouterForAdmin,
      );
      this.#logsStorage.mountRoutes(logsStorageContext, logsStorageRouterForHost, logsStorageRouterForAdmin);
      routesForHostGroup.use(LogsStorageRoutesMountPrefix, logsStorageRouterForHost);
      routesForAdminGroup.use(LogsStorageRoutesMountPrefix, logsStorageRouterForAdmin);
    }

    app.use('/host', routesForHostGroup);
    app.use('/admin', routesForAdminGroup);
  }

  async #processHook(context: DataSourceContext, hookKey: ServerConfigHooksKeysInterface, payload: object) {
    const key = Joi.attempt(
      hookKey,
      ServerConfigHooksKeysSchema,
      `Invalid hook key ${hookKey}: `,
    ) as keyof ServerConfigHooksInterface;
    const schema = this.#config.hooks?.[key];
    if (schema == null) {
      context.logger.debug(`No hook found for ${key}`);
      return;
    }
    const configs = Array.isArray(schema) ? schema : [schema];
    for (let i = 0; i < configs.length; i++) {
      const hookId = `${key}/${i}`;
      const configWithTemplates = extractAllTemplates(configs[i]);
      try {
        const config = (await resolveTemplates(configWithTemplates, payload)) as ServerHookInterface;

        if (config.if) {
          const ifTemplate = new IfTemplate(config.if);
          if (!(await ifTemplate.isTrue(payload))) {
            context.logger.debug(`Hook skipped ${hookId}`);
            continue;
          }
        }

        const instance = notifierRegistry.getRegistryEntryInstanceFromIndexedConfig<AbstractNotifierInstance>(
          config,
          ServerHookSchema,
        );

        await instance.notify(context);
        context.logger.debug(`Hook ${hookId} executed`);
      } catch (ex) {
        context.logger.error(`Failed to run hook ${hookId}`, ex);
      }
    }
  }
}
