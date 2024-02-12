/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { Express } from 'express';
import type { Logger } from 'winston';
import { fsPromiseTmpDir } from '../../util/fs';
import FormData from 'form-data';
import type { Axios } from 'axios';
import axios from 'axios';
import type { AgentConfigInterface } from './kiwiAgent.schema.gen';
import { AgentConfigSchema } from './kiwiAgent.schema';
import type { KiwiProviderRouteGetConfigForHostnameResultInterface } from '../kiwiProvider/kiwiProvider.schema.gen';
import { Archive } from '../../components/archive';
import type { Recipe } from '../../components/recipe';
import type { DataSourceContext } from '../../dataSources/abstractDataSource';
import { KiwiProviderHeaderHostname } from '../kiwiProvider/kiwiProvider.schema';
import { HostReportStatus, HostReportType } from '../common/models.schema';
import type { HostReportRequestInterface } from '../common/models.schema.gen';
import { getChildLoggerWithLogFile } from '../../util/logger';
import { ReleaseDatabase } from './releaseDatabase';
import type { CompileArchiveForHostResultInterface } from '../../commands/compileArchiveForHost.schema.gen';
import type { AbstractAssetsDistributionGetDownloadUrlResponseInterface } from '../../assetsDistribution/abstractAssetsDistribution.schema.gen';
import { AbstractAssetsDistributionGetDownloadUrlResponseSchema } from '../../assetsDistribution/abstractAssetsDistribution.schema';
import { downloadFile } from '../../util/download';
import path from 'node:path';
import type {
  AbstractLogsStorageGetUploadUrlRequestInterface,
  AbstractLogsStorageGetUploadUrlResponseInterface,
} from '../../logsStorage/abstractLogsStorage.schema.gen';
import {
  AbstractLogsStorageGetUploadUrlResponseSchema,
  LogsStorageRoutesMountPrefix,
} from '../../logsStorage/abstractLogsStorage.schema';
import fs from 'node:fs';
import { mkdirp } from 'mkdirp';
import type { ContextLogger } from '../../util/context';
import { addDefaultInterceptors } from '../../util/axios';
import { Inventory } from '../../components/inventory';
import * as os from 'node:os';
import type { InventoryInterface } from '../../components/inventory.schema.gen';
import { runRecipe } from '../../commands/runRecipe';
import { joiAttemptRequired } from '../../util/joi';
import { normalizePathToUnix } from '../../util/path';
import { RecipePhase } from '../../components/recipe.schema';

interface QueueItem {
  release: string;
  inventory: InventoryInterface;
  recipe: Recipe;
}

interface ApiContext extends DataSourceContext {
  apiClient: Axios;
  externalAPIClient: Axios;
}

interface ReloadReleaseResult {
  oldRelease?: string;
  release: string;
  changed: boolean;
}

export class KiwiAgent {
  readonly #config: AgentConfigInterface;
  readonly #context: ApiContext;
  readonly #db: ReleaseDatabase;
  readonly #hostname: string;

  constructor(logger: Logger, config: AgentConfigInterface) {
    this.#config = joiAttemptRequired(config, AgentConfigSchema);
    this.#hostname = this.#config.hostname ?? os.hostname();
    const childLogger = logger.child({ server: 'worker' });
    const loggerContext: ContextLogger = { logger: childLogger };
    const apiClient = this.#newApiClient(loggerContext, 'Default');
    const externalAPIClient = this.#newExternalAPIClient(loggerContext, 'Default');

    this.#context = {
      ...loggerContext,
      workDir: undefined,
      apiClient,
      externalAPIClient,
    };
    this.#db = new ReleaseDatabase(config.databasePath);
  }

  #newApiClient(context: ContextLogger, prefixText: string): Axios {
    const client = axios.create({
      baseURL: `${this.#config.kiwiProviderUrl}/host`,
      headers: { [KiwiProviderHeaderHostname]: this.#hostname },
    });
    addDefaultInterceptors(context, client, 'Api' + prefixText);
    return client;
  }

  #newExternalAPIClient(context: ContextLogger, prefixText: string): Axios {
    const client = axios.create({});
    addDefaultInterceptors(context, client, 'ApiExt' + prefixText);
    return client;
  }

  async reloadRelease(phase: RecipePhase, force?: boolean): Promise<ReloadReleaseResult> {
    const oldRelease = (await this.#db.exists()) ? await this.#db.getRelease() : undefined;

    const release = (await this.#context.apiClient.get('/release')).data.release as string;

    if (!force && oldRelease == release) {
      return {
        release,
        changed: false,
      };
    }

    await this.#processNewRelease(
      {
        ...this.#context,
        workDir: undefined,
      },
      phase,
      release
    );

    await this.#db.set({ release });
    return {
      release,
      oldRelease,
      changed: true,
    };
  }

  mountRoutes(app: Express) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    app.get('/current', async (req, res) => {
      res.status(200).json(await this.#db.get());
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    app.get('/reload', async (req, res) => {
      const result = await this.reloadRelease(RecipePhase.runtime, req.query.force == 'true');
      res.status(200).json(result);
    });
  }

  async #reportStatus(
    context: ApiContext,
    release: string,
    type: HostReportType,
    key: string,
    status: HostReportStatus
  ): Promise<HostReportStatus> {
    const data: HostReportRequestInterface = {
      hostname: this.#hostname,
      type,
      key,
      release,
      status,
      timestamp: new Date().getTime(),
    };

    try {
      await context.apiClient.post('/report', data);
      context.logger.info('Reported status', data);
    } catch (ex) {
      context.logger.info('Failed to report status', {
        report: data,
        ex,
      });
    }

    return status;
  }

  async #downloadAllAssetsArchives(
    context: ApiContext,
    assetsDir: string,
    config: CompileArchiveForHostResultInterface
  ) {
    context.logger.info(`Downloading assets to ${assetsDir}`);
    const allAssets: string[] = [
      Object.values(config.archive.rootRecipes).map((v) => v.assetsArchive),
      Object.values(config.archive.recipeSources)
        .map((v) => Object.values(v))
        .flat()
        .map((v) => v.assetsArchive),
    ]
      .flat()
      .filter(Boolean) as string[];

    for (const assetFile of allAssets) {
      const resp = await context.apiClient.get('/assetsDistribution/downloadUrl', { params: { assetFile } });
      const downloadUrlResp = joiAttemptRequired(
        resp.data,
        AbstractAssetsDistributionGetDownloadUrlResponseSchema
      ) as AbstractAssetsDistributionGetDownloadUrlResponseInterface;

      const downloadFromSelfAPI = downloadUrlResp.downloadUrl.startsWith('.');
      const downloadUrl = downloadFromSelfAPI
        ? normalizePathToUnix(`/assetsDistribution/${downloadUrlResp.downloadUrl}`)
        : downloadUrlResp.downloadUrl;

      context.logger.info(`Downloading archive ${assetFile} from ${downloadUrl}`);

      const destination = path.join(assetsDir, assetFile);
      const dirName = path.dirname(destination);
      await mkdirp(dirName);
      await downloadFile(downloadUrl, destination, downloadFromSelfAPI ? context.apiClient : context.externalAPIClient);
    }
  }

  async #processNewRelease(context: ApiContext, phase: RecipePhase, release: string) {
    context.logger.info(`Processing release ${release} in phase ${phase}`);
    const childLogger = await getChildLoggerWithLogFile(context, 'init');
    let status = HostReportStatus.pending;
    await childLogger.wrapContext(
      context,
      async (_context) => {
        try {
          const apiClient = this.#newApiClient(_context, 'Release');
          const externalAPIClient = this.#newExternalAPIClient(_context, 'Release');

          const context: ApiContext = {
            ..._context,
            apiClient,
            externalAPIClient,
          };

          status = await this.#reportStatus(context, release, HostReportType.init, release, HostReportStatus.running);

          const configForHostname: KiwiProviderRouteGetConfigForHostnameResultInterface = (
            await apiClient.get(`/config/${release}`)
          ).data;

          const assetsDir = await fsPromiseTmpDir({});
          await this.#downloadAllAssetsArchives(context, assetsDir, configForHostname.compileResult);
          const archive = new Archive(configForHostname.compileResult.archive, assetsDir);
          const inventory = configForHostname.compileResult.inventory;
          const recipes = await archive.getInstantiatedRootRecipes(context, false, {
            phase,
          });
          for (const recipe of recipes) {
            await this.#queueRecipe(context, release, inventory, recipe);
          }

          status = await this.#reportStatus(context, release, HostReportType.init, release, HostReportStatus.success);
        } catch (ex) {
          status = await this.#reportStatus(context, release, HostReportType.init, release, HostReportStatus.failure);
          // Interrupt the whole processing
          throw ex;
        }
      },
      async (originalContext) => {
        // No matter what, upload the execution logs
        childLogger.logger.close();
        try {
          await this.#uploadLogs(originalContext, release, HostReportType.init, release, status, childLogger.logFile);
        } catch (ex) {
          originalContext.logger.error('Failed to upload logs', { error: ex });
        }
      }
    );

    await this.#processQueue(context);
  }

  #queue: QueueItem[] = [];

  async #queueRecipe(context: ApiContext, release: string, inventory: InventoryInterface, recipe: Recipe) {
    const recipeId = recipe.fullId;
    if (recipeId == null) {
      throw new Error('Tried to queue a recipe without an id');
    }
    await this.#reportStatus(context, release, HostReportType.recipe, recipeId, HostReportStatus.pending);
    this.#queue.push({
      release,
      inventory,
      recipe,
    });
  }

  async #uploadLogs(
    context: ApiContext,
    release: string,
    type: HostReportType,
    key: string,
    status: HostReportStatus,
    logFile: string
  ) {
    const data: AbstractLogsStorageGetUploadUrlRequestInterface = {
      hostname: this.#hostname,
      release,
      type,
      key,
      status,
    };
    const resp = await context.apiClient.post(`${LogsStorageRoutesMountPrefix}/uploadUrl`, data);
    const uploadInfo = joiAttemptRequired(
      resp.data,
      AbstractLogsStorageGetUploadUrlResponseSchema
    ) as AbstractLogsStorageGetUploadUrlResponseInterface;

    const uploadSelfAPI = uploadInfo.uploadUrl.startsWith('.');
    const uploadUrl = uploadSelfAPI
      ? normalizePathToUnix(`${LogsStorageRoutesMountPrefix}/${uploadInfo.uploadUrl}`)
      : uploadInfo.uploadUrl;

    context.logger.info(`Uploading log file ${logFile} to ${uploadUrl} with storageKey ${uploadInfo.storageKey}`);

    const fileStream = fs.createReadStream(logFile);
    const form = new FormData();
    form.append('file', fileStream);

    const client = uploadSelfAPI ? context.apiClient : context.externalAPIClient;
    await client.put(uploadUrl, form, { headers: { ...form.getHeaders() } });
  }

  async runRecipeFromQueueItem(context: DataSourceContext, queueItem: QueueItem) {
    const inventory = new Inventory(queueItem.inventory);
    await inventory.loadHostStubsAndGroups(context, true);

    await runRecipe(context, {
      hostname: this.#hostname,
      inventory,
      recipe: queueItem.recipe,
    });
  }

  async #processQueue(context: ApiContext) {
    let item: QueueItem | undefined;
    while ((item = this.#queue.shift()) != null) {
      const queueItem = item;
      const recipeId = queueItem.recipe.fullId!;
      const childLogger = await getChildLoggerWithLogFile(context, `recipe_${recipeId}`);

      let status = HostReportStatus.pending;
      await childLogger.wrapContext(
        context,
        async (context) => {
          // NOTE: we use the default api clients here because we don't want to pollute recipes' execution logs with useless calls

          context.logger.info(`Processing recipe: ${recipeId}`);

          const recipeRunContext: DataSourceContext = {
            ...context,
            logger: context.logger,
          };
          try {
            status = await this.#reportStatus(
              context,
              queueItem.release,
              HostReportType.recipe,
              recipeId,
              HostReportStatus.running
            );
            await this.runRecipeFromQueueItem(recipeRunContext, queueItem);
            status = await this.#reportStatus(
              context,
              queueItem.release,
              HostReportType.recipe,
              recipeId,
              HostReportStatus.success
            );
          } catch (ex) {
            context.logger.error('Failed to run recipe', { error: ex });
            status = await this.#reportStatus(
              context,
              queueItem.release,
              HostReportType.recipe,
              recipeId,
              HostReportStatus.failure
            );
            // Interrupt the whole processing
            throw ex;
          }
        },
        async (originalContext) => {
          // No matter what, upload the execution logs
          childLogger.logger.close();
          try {
            await this.#uploadLogs(
              originalContext,
              queueItem.release,
              HostReportType.recipe,
              recipeId,
              status,
              childLogger.logFile
            );
          } catch (ex) {
            originalContext.logger.error('Failed to upload logs', { error: ex });
          }
        }
      );
    }
  }
}
