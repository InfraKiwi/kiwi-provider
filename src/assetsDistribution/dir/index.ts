/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { AbstractAssetsDistribution } from '../abstractAssetsDistribution';
import { assetsDistributionRegistryEntryFactory } from '../registry';
import { AssetsDistributionDirSchema } from './schema';
import type { AssetsDistributionDirInterface } from './schema.gen';
import type e from 'express';
import type { ContextLogger } from '../../util/context';
import express from 'express';

export class AssetsDistributionDir extends AbstractAssetsDistribution<AssetsDistributionDirInterface> {
  mountRoutes(context: ContextLogger, app: e.IRouter) {
    app.use('/static', express.static(this.config.path));
  }

  async getDownloadUrl(context: ContextLogger, assetsFile: string): Promise<string> {
    return `./static/` + assetsFile;
  }
}

assetsDistributionRegistryEntryFactory.register(AssetsDistributionDirSchema, AssetsDistributionDir);
