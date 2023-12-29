/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { AssetsDistributionContext } from '../abstractAssetsDistribution';
import { AbstractAssetsDistribution } from '../abstractAssetsDistribution';
import { assetsDistributionRegistryEntryFactory } from '../registry';
import { AssetsDistributionDirSchema } from './schema';
import type { AssetsDistributionDirInterface } from './schema.gen';
import type e from 'express';
import path from 'node:path';

export class AssetsDistributionDir extends AbstractAssetsDistribution<AssetsDistributionDirInterface> {
  mountRoutes(context: AssetsDistributionContext, app: e.IRouter) {
    // NOOP, the client will receive the assets directly on their filesystem
  }

  async getDownloadUrl(context: AssetsDistributionContext, assetsFile: string): Promise<string> {
    const filePath = path.join(this.config.path, assetsFile);
    return `file:///${filePath}`;
  }
}

assetsDistributionRegistryEntryFactory.register(AssetsDistributionDirSchema, AssetsDistributionDir);
