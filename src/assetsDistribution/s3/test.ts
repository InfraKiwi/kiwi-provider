/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { testUtilSpinUpS3Endpoint } from '../../testutil/s3';
import { getTestRunContext } from '../../components/inventory.testutils';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { testUtilTearDown } from '../../testutil/runner';
import { AssetsDistributionS3 } from './index';
import axios from 'axios';
import { testTimeoutLong } from '../../util/constants';

describe('assets distribution s3', () => {
  afterEach(() => testUtilTearDown());

  test(
    'it runs with minio',
    async () => {
      const context = getTestRunContext();

      const { s3Client, s3BucketName, s3Endpoint, s3Username, s3Password } = await testUtilSpinUpS3Endpoint(context);

      // Test we can upload and download files
      const testBody = `hello-${new Date().getTime()}`;
      const testFile = '.test';
      await s3Client.send(
        new PutObjectCommand({
          Bucket: s3BucketName,
          Key: testFile,
          Body: testBody,
        })
      );

      const module = new AssetsDistributionS3({
        bucket: s3BucketName,
        endpoint: s3Endpoint,
        credentials: {
          accessKeyId: s3Username,
          secretAccessKey: s3Password,
        },
      });

      const downloadUrl = await module.getDownloadUrl(context, testFile);
      context.logger.info(`Download url: ${downloadUrl}`);
      const body = (await axios.get(downloadUrl)).data;
      context.logger.info(`Body: ${body}`);
      expect(body).toEqual(testBody);
    },
    testTimeoutLong
  );
});
