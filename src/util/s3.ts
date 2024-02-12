/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { S3Client } from '@aws-sdk/client-s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { normalizePathToUnix } from './path';
import path from 'node:path';
import type { joiParseArgsS3OptionsInterface } from './s3.schema.gen';
import { getAllFiles } from './fs';
import pLimit from 'p-limit';
import { createReadStream } from 'node:fs';
import type { ContextLogger } from './context';

export async function verifyS3WriteAccess(client: S3Client, bucket: string, prefix?: string) {
  await client.send(
    new PutObjectCommand({
      Body: `${new Date().getTime()}`,
      Bucket: bucket,
      Key: normalizePathToUnix(prefix ? path.join(prefix, '.uploadTest') : '.uploadTest'),
    })
  );
}

export async function getS3ClientFromJoiParseArgsS3Options(
  options: joiParseArgsS3OptionsInterface,
  verifyWriteAccess: boolean
): Promise<S3Client | undefined> {
  if (options.s3Bucket == null) {
    return;
  }
  const client = new S3Client({
    endpoint: options.s3Endpoint,
  });
  if (verifyWriteAccess) {
    await verifyS3WriteAccess(client, options.s3Bucket, options.s3Prefix);
  }
  return client;
}

export async function uploadDirToS3(
  context: ContextLogger,
  dir: string,
  s3Client: S3Client,
  bucket: string,
  prefix?: string,
  maxConcurrency = 5
) {
  if (prefix) {
    prefix = normalizePathToUnix(prefix);
  }
  const files = await getAllFiles(dir);
  const limit = pLimit(maxConcurrency);

  const promises = files.map((file) =>
    limit(() =>
      s3Client.send(
        new PutObjectCommand({
          Key: normalizePathToUnix(prefix ? path.join(prefix, file) : file),
          Bucket: bucket,
          Body: createReadStream(path.join(dir, file)),
        })
      )
    )
  );

  await Promise.all(promises);
  context.logger.info(`Uploaded ${files.length} files to s3 bucket ${bucket}${prefix ? '/' + prefix : ''}`);
}
