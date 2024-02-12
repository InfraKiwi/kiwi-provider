/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { AbstractAssetsDistribution } from '../abstractAssetsDistribution';
import { assetsDistributionRegistryEntryFactory } from '../registry';
import { AssetsDistributionS3Schema } from './schema';
import type { AssetsDistributionS3Interface } from './schema.gen';
import type { ContextLogger } from '../../util/context';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { omit } from '../../util/object';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class AssetsDistributionS3 extends AbstractAssetsDistribution<AssetsDistributionS3Interface> {
  #client: S3Client = new S3Client({
    ...omit(this.config, ['bucket', 'prefix']),
  });
  #clientForClients: S3Client = this.config.endpointForClients
    ? new S3Client({
        ...omit(this.config, ['endpoint', 'bucket', 'prefix']),
        endpoint: this.config.endpointForClients,
      })
    : this.#client;
  #prefix = AssetsDistributionS3.#cleanPrefix(this.config.prefix);

  async getDownloadUrl(context: ContextLogger, assetsFile: string): Promise<string> {
    const key = `${this.#prefix}${assetsFile}`;
    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });
    const url = getSignedUrl(this.#clientForClients, command, { expiresIn: 3600 });
    return url;
  }

  static #cleanPrefix(prefix: string | undefined): string {
    prefix ??= '';
    prefix = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
    if (prefix == '') {
      return '';
    }
    prefix += '/';
    return prefix;
  }
}

assetsDistributionRegistryEntryFactory.register(AssetsDistributionS3Schema, AssetsDistributionS3);
