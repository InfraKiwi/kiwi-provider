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
import Joi from 'joi';
import {
  AbstractAssetsDistributionGetDownloadUrlRequestSchema,
  AbstractAssetsDistributionGetDownloadUrlRoutePath,
} from './abstractAssetsDistribution.schema';

export interface AssetsDistributionContext extends ContextLogger {}

export abstract class AbstractAssetsDistribution<ConfigType> extends AbstractRegistryEntry<ConfigType> {
  // Provides the client an url that can be used to download the desired archive file
  abstract getDownloadUrl(context: AssetsDistributionContext, assetsFile: string): Promise<string>;

  /*
   * Mount any routes that may be needed to download the provided file
   * These routes will be exposed under the /assetsDistribution router.
   */
  abstract mountRoutes(context: AssetsDistributionContext, app: IRouter): void;

  static mountStaticRoutes(
    context: AssetsDistributionContext,
    app: IRouter,
    assetsDistribution: AbstractAssetsDistributionInstance
  ) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    app.get(AbstractAssetsDistributionGetDownloadUrlRoutePath, async (req, res) => {
      const reqData = Joi.attempt(
        req.query,
        AbstractAssetsDistributionGetDownloadUrlRequestSchema
      ) as AbstractAssetsDistributionGetDownloadUrlRequestInterface;
      const url = await assetsDistribution.getDownloadUrl(context, reqData.assetFile);
      if (reqData.plain) {
        res.send(url);
        return;
      }
      const resData: AbstractAssetsDistributionGetDownloadUrlResponseInterface = { downloadUrl: url };
      res.send(resData);
    });
  }
}

export type AbstractAssetsDistributionInstance = InstanceType<typeof AbstractAssetsDistribution>;
