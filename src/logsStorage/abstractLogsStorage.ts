import { AbstractRegistryEntry } from '../util/registry';
import type e from 'express';
import Joi from 'joi';
import {
  AbstractLogsStorageGetUploadUrlRequestSchema,
  LogsStorageRoutesMountPrefix,
} from './abstractLogsStorage.schema';
import type {
  AbstractLogsStorageGetDownloadUrlResponseInterface,
  AbstractLogsStorageGetUploadUrlRequestInterface,
  AbstractLogsStorageGetUploadUrlResponseInterface,
} from './abstractLogsStorage.schema.gen';
import type { HostLogs, Prisma, PrismaClient } from '@prisma/client';
import { createHash } from 'node:crypto';
import type { DataSourceContext } from '../dataSources/abstractDataSource';

export interface LogsStorageContext extends DataSourceContext {
  client: PrismaClient;
}

export abstract class AbstractLogsStorage<ConfigType> extends AbstractRegistryEntry<ConfigType> {
  // Returns an upload url the client can use to upload log files
  abstract getUploadUrl(context: LogsStorageContext, hash: string, storageKey: string): Promise<string>;

  // Get the url we can use to download the logs
  abstract getDownloadUrl(context: LogsStorageContext, hash: string): Promise<string>;

  /*
   * Mount any routes that may be needed to handle log uploads.
   * These routes will be exposed under the /logsStorage router.
   */
  abstract mountRoutes(context: LogsStorageContext, appForHost: e.IRouter, appForAdmin: e.IRouter): void;

  static async markUploadAsCompleted(context: LogsStorageContext, hash: string, size?: number): Promise<HostLogs> {
    return context.client.hostLogs.update({
      where: {
        hash,
        completed: false,
      },
      data: {
        completed: true,
        size,
      },
    });
  }

  static mountStaticRoutes(
    context: LogsStorageContext,
    logsStorage: AbstractLogsStorageInstance,
    appForHost: e.IRouter,
    appForAdmin: e.IRouter,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    appForHost.post('/uploadUrl', async (req, res) => {
      const reqData = Joi.attempt(
        req.body,
        AbstractLogsStorageGetUploadUrlRequestSchema,
      ) as AbstractLogsStorageGetUploadUrlRequestInterface;
      if (reqData.hostname != req.clientHostname) {
        throw new Error(`Hostname mismatch`);
      }

      const reportId = {
        hostname: reqData.hostname,
        release: reqData.release,
        type: reqData.type,
        key: reqData.key,
      };

      const keyParts = [reqData.hostname, reqData.release, reqData.type, reqData.key];

      const now = new Date();

      const storageKey = `${keyParts.map((k) => k.replaceAll(/\W/g, '_')).join('/')}_${now.getTime()}.log`;
      const hashInst = createHash('sha512');
      hashInst.update(storageKey);
      const hash = hashInst.digest('hex');
      const uploadUrl = await logsStorage.getUploadUrl(context, hash, storageKey);
      const uploadUrlWithPrefix = LogsStorageRoutesMountPrefix + uploadUrl;

      const data: Prisma.HostLogsCreateInput = {
        hostReport: { connect: { hostname_release_type_key: reportId } },
        status: reqData.status,
        hash,
        storageKey,
        completed: false,
        timestamp: now,
      };

      await context.client.hostLogs.create({ data });

      const resp: AbstractLogsStorageGetUploadUrlResponseInterface = {
        storageKey,
        uploadUrl: uploadUrlWithPrefix,
      };
      res.send(resp);
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    appForAdmin.get('/downloadUrl/:hash', async (req, res) => {
      const hash = req.params.hash;
      const downloadUrl = await logsStorage.getDownloadUrl(context, hash);
      const downloadUrlWithPrefix = '/admin' + LogsStorageRoutesMountPrefix + downloadUrl;

      if (req.query.redirect) {
        res.redirect(downloadUrlWithPrefix);
        return;
      }

      const resp: AbstractLogsStorageGetDownloadUrlResponseInterface = { downloadUrl: downloadUrlWithPrefix };
      res.send(resp);
    });
  }
}

export type AbstractLogsStorageInstance = InstanceType<typeof AbstractLogsStorage>;
