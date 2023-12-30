/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { AbstractRegistryEntry } from '../util/registry';
import type { ContextLogger } from '../util/context';
import type { IRouter } from 'express';
import type {
  AbstractAssetsDistributionGetDownloadUrlRequestInterface,
  AbstractAssetsDistributionGetDownloadUrlResponseInterface,
} from './abstractAssetsDistribution.schema.gen';
import {
  AbstractAssetsDistributionGetDownloadUrlRequestSchema,
  AbstractAssetsDistributionGetDownloadUrlRoutePath,
} from './abstractAssetsDistribution.schema';
import { joiAttemptRequired } from '../util/joi';
import { normalizePathToUnix } from '../util/path';

export abstract class AbstractAssetsDistribution<ConfigType> extends AbstractRegistryEntry<ConfigType> {
  /*
   * Provides the client an url that can be used to download the desired archive file.
   * If the returned path starts with `.`, then it will be treated as relative to the
   * router mount point.
   */
  abstract getDownloadUrl(context: ContextLogger, assetsFile: string): Promise<string>;

  /*
   * Mount any routes that may be needed to download the provided file
   */
  abstract mountRoutes(context: ContextLogger, app: IRouter): void;

  static mountStaticRoutes(
    context: ContextLogger,
    app: IRouter,
    assetsDistribution: AbstractAssetsDistributionInstance
  ) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    app.get(AbstractAssetsDistributionGetDownloadUrlRoutePath, async (req, res) => {
      const reqData = joiAttemptRequired(
        req.query,
        AbstractAssetsDistributionGetDownloadUrlRequestSchema
      ) as AbstractAssetsDistributionGetDownloadUrlRequestInterface;
      let downloadUrl = await assetsDistribution.getDownloadUrl(context, reqData.assetFile);

      if (downloadUrl.startsWith('.')) {
        downloadUrl = './' + normalizePathToUnix(downloadUrl);
      }

      if (reqData.redirect) {
        res.redirect(downloadUrl);
        return;
      }

      if (reqData.plain) {
        res.send(downloadUrl);
        return;
      }
      const resData: AbstractAssetsDistributionGetDownloadUrlResponseInterface = { downloadUrl };
      res.send(resData);
    });
  }
}

export type AbstractAssetsDistributionInstance = InstanceType<typeof AbstractAssetsDistribution>;
