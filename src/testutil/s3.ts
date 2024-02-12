/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { RunnerDocker } from '../runners/docker';
import type { AbstractRunnerInstance, RunnerContextSetup } from '../runners/abstractRunner';
import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import { testUtilRegisterRunner } from './runner';
import { getFreeTCPPort } from '../util/net';

export interface TestUtilSpinUpS3EndpointResult {
  s3Client: S3Client;
  runner: AbstractRunnerInstance;
  s3Username: string;
  s3Password: string;
  s3Endpoint: string;
  s3BucketName: string;
  portS3: number;
  portConsole: number;
}

/**
 * Spins up a MinIO docker container
 */
export async function testUtilSpinUpS3Endpoint(context: RunnerContextSetup): Promise<TestUtilSpinUpS3EndpointResult> {
  const s3Username = 'root';
  const s3Password = 'root123123123';
  const s3BucketName = 'testbucket';

  const portS3 = await getFreeTCPPort();
  const portConsole = await getFreeTCPPort();
  const s3Endpoint = `http://127.0.0.1:${portS3}`;
  const runner = new RunnerDocker({
    image: 'quay.io/minio/minio',
    runArgs: [
      '-p',
      `${portS3}:${portS3}`,
      '-p',
      `${portConsole}:${portConsole}`,
      '-e',
      `MINIO_ROOT_USER=${s3Username}`,
      '-e',
      `MINIO_ROOT_PASSWORD=${s3Password}`,
      '--entrypoint',
      'sh',
    ],
    sleepCommand: [
      '-c',
      `mkdir -p /data/${s3BucketName} && minio server /data --address :${portS3} --console-address :${portConsole}`,
    ],
    ready: {
      http: {
        url: `http://127.0.0.1:${portS3}/minio/health/live`,
      },
    },
  });
  await runner.setUp(context, {
    skipKiwiSetup: true,
  });
  testUtilRegisterRunner(runner);

  const s3Client = new S3Client({
    endpoint: s3Endpoint,
    credentials: {
      accessKeyId: s3Username,
      secretAccessKey: s3Password,
    },
  });
  context.logger.info(`Bucket list`, { list: await s3Client.send(new ListBucketsCommand({})) });

  return {
    s3Client,
    runner,
    s3Username,
    s3Password,
    s3Endpoint,
    s3BucketName,
    portS3,
    portConsole,
  };
}
