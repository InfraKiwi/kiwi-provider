import { newDebug } from '../../util/debug';
import type { AssetsDistributionContext } from '../abstractAssetsDistribution';
import { AbstractAssetsDistribution } from '../abstractAssetsDistribution';
import { assetsDistributionRegistryEntryFactory } from '../registry';
import { AssetsDistributionDirSchema } from './schema';
import type { AssetsDistributionDirInterface } from './schema.gen';
import type e from 'express';
import path from 'node:path';

const debug = newDebug(__filename);

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
