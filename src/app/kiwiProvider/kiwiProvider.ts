/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { Express, Request } from 'express';
import { compileArchiveForHost } from '../../commands/compileArchiveForHost';
import type { Logger } from 'winston';
import { tryOrThrow, tryOrThrowAsync } from '../../util/try';
import { Inventory } from '../../components/inventory';
import type { InventoryInterface } from '../../components/inventory.schema.gen';
import type { DataSourceContext } from '../../dataSources/abstractDataSource';
import { Archive } from '../../components/archive';
import type {
  KiwiProviderConfigInterface,
  KiwiProviderHooksInterface,
  KiwiProviderHooksKeysInterface,
  KiwiProviderRouteGetConfigForHostnameResultInterface,
} from './kiwiProvider.schema.gen';
import {
  AssetsDistributionSchema,
  LogsStorageSchema,
  KiwiProviderConfigSchema,
  KiwiProviderHeaderHostname,
  KiwiProviderHooksKeysSchema,
  KiwiProviderRoutesBootstrapPath,
  KiwiProviderRoutesHostPath,
  KiwiProviderRoutesAdminPath,
} from './kiwiProvider.schema';
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
import { mountRoutesUI } from './routes.ui';

import '../../util/loadAllRegistryEntries.kiwiProvider.gen';
import { extractAllTemplates, IfTemplate, resolveTemplates } from '../../util/tpl';
import type { ServerHookInterface } from '../common/server.schema.gen';
import type { AbstractHookInstance } from '../../hooks/abstractHook';
import { hookRegistry } from '../../hooks/registry';
import { ServerHookSchema } from '../common/server.schema';
import { mountRoutesAgentDistribution } from './routes.agentDistribution';

import { loadYAMLFromFile } from '../../util/yaml';
import { joiAttemptRequired } from '../../util/joi';
import { getNewDefaultRouter } from '../../util/expressRoutes';
import { getArrayFromSingleOrArray } from '../../util/array';

interface PreloadedHooks {
  config: ServerHookInterface;
  instance: AbstractHookInstance;
}

export class KiwiProvider {
  readonly #config: KiwiProviderConfigInterface;
  readonly #externalUrl: string;
  readonly #logger: Logger;
  readonly #client: PrismaClient;
  readonly #assetsDistribution: AbstractAssetsDistributionInstance;
  readonly #agentDistribution: AbstractAssetsDistributionInstance;
  readonly #logsStorage: AbstractLogsStorageInstance;
  readonly #context: DataSourceContext;
  readonly #hooks: { [key in keyof KiwiProviderHooksInterface]: PreloadedHooks[] } = {};

  constructor(logger: Logger, config: KiwiProviderConfigInterface, externalUrl: string) {
    this.#config = joiAttemptRequired(config, KiwiProviderConfigSchema, 'Failed to validate kiwiProvider config: ');
    this.#externalUrl = externalUrl;
    this.#logger = logger.child({ server: 'config' });
    this.#client = new PrismaClient();
    this.#context = {
      logger: this.#logger,
      workDir: this.#config.workDir,
    };

    this.#assetsDistribution =
      assetsDistributionRegistry.getRegistryEntryInstanceFromIndexedConfig<AbstractAssetsDistributionInstance>(
        this.#config.assetsDistribution,
        AssetsDistributionSchema
      );
    this.#agentDistribution =
      assetsDistributionRegistry.getRegistryEntryInstanceFromIndexedConfig<AbstractAssetsDistributionInstance>(
        this.#config.agentDistribution,
        AssetsDistributionSchema
      );

    this.#logsStorage = logsStorageRegistry.getRegistryEntryInstanceFromIndexedConfig<AbstractLogsStorageInstance>(
      this.#config.logsStorage,
      LogsStorageSchema
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
      const data = await loadYAMLFromFile(this.#config.inventoryPath);
      const inventory = tryOrThrow(
        () => new Inventory(data as InventoryInterface),
        `Failed to load inventory ${this.#config.inventoryPath}`
      );
      await tryOrThrowAsync(
        () => inventory.loadHostStubsAndGroups(this.#context),
        'Failed to load inventory host stubs'
      );
      this.#inventory = inventory;
    }

    this.#archive = await Archive.fromConfigFile(this.#config.archiveFile);
  }

  mountRoutes(app: Express) {
    const routesForAdminGroup = getNewDefaultRouter();
    {
      // TODO auth?

      mountRoutesUI(
        {
          ...this.#context,
          client: this.#client,
        },
        routesForAdminGroup
      );

      // Just redirect to the UI
      routesForAdminGroup.get('/', (req, res) => res.redirect('./ui/'));
    }

    const routesForBootstrapGroup = getNewDefaultRouter();
    {
      mountRoutesAgentDistribution(this.#context, routesForBootstrapGroup, {
        assetDistributionInstance: this.#agentDistribution,
        appExternalUrl: this.#externalUrl,
        routerParentPath: KiwiProviderRoutesBootstrapPath,
      });
    }

    const routesForHostGroup = getNewDefaultRouter();
    {
      // Auth
      routesForHostGroup.use((req, res, next) => {
        const hostname = (req.query['hostname'] as string) ?? req.header(KiwiProviderHeaderHostname);
        if (hostname == null) {
          throw new Error('Missing requester hostname');
        }
        req.clientHostname = hostname;
        next();
      });

      routesForHostGroup.get('/release', (req, res) => {
        res.status(200).json({ release: this.release });
      });

      {
        const assetsDistributionRouter = getNewDefaultRouter();
        AbstractAssetsDistribution.mountStaticRoutes(this.#context, assetsDistributionRouter, this.#assetsDistribution);
        this.#assetsDistribution.mountRoutes(this.#context, assetsDistributionRouter);
        routesForHostGroup.use('/assetsDistribution', assetsDistributionRouter);
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
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

        const result: KiwiProviderRouteGetConfigForHostnameResultInterface = { compileResult };

        res.status(200).json(result);
      });

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      routesForHostGroup.post('/report', async (req, res) => {
        const data = joiAttemptRequired(req.body, HostReportRequestSchema) as HostReportRequestInterface;
        if (data.hostname != req.clientHostname) {
          throw new Error('Mismatching hostname');
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
      const logsStorageRouterForHost = getNewDefaultRouter();
      const logsStorageRouterForAdmin = getNewDefaultRouter();
      AbstractLogsStorage.mountStaticRoutes(
        logsStorageContext,
        this.#logsStorage,
        logsStorageRouterForHost,
        logsStorageRouterForAdmin
      );
      this.#logsStorage.mountRoutes(logsStorageContext, logsStorageRouterForHost, logsStorageRouterForAdmin);
      routesForHostGroup.use(LogsStorageRoutesMountPrefix, logsStorageRouterForHost);
      routesForAdminGroup.use(LogsStorageRoutesMountPrefix, logsStorageRouterForAdmin);
    }

    app.use(KiwiProviderRoutesBootstrapPath, routesForBootstrapGroup);
    app.use(KiwiProviderRoutesHostPath, routesForHostGroup);
    app.use(KiwiProviderRoutesAdminPath, routesForAdminGroup);
  }

  async #processHook(context: DataSourceContext, hookKey: KiwiProviderHooksKeysInterface, payload: object) {
    const key = joiAttemptRequired(
      hookKey,
      KiwiProviderHooksKeysSchema,
      `Invalid hook key ${hookKey}: `
    ) as keyof KiwiProviderHooksInterface;
    const schema = this.#config.hooks?.[key];
    if (schema == null) {
      context.logger.debug(`No hook found for ${key}`);
      return;
    }
    const configs = getArrayFromSingleOrArray(schema);
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

        const instance = hookRegistry.getRegistryEntryInstanceFromIndexedConfig<AbstractHookInstance>(
          config,
          ServerHookSchema
        );

        await instance.notify(context);
        context.logger.debug(`Hook ${hookId} executed`);
      } catch (ex) {
        context.logger.error(`Failed to run hook ${hookId}`, ex);
      }
    }
  }
}
