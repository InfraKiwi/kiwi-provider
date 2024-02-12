/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RecipeCtorContext } from '../components/recipe';
import path from 'node:path';
import { mainKiwiCreateArchive } from '../../cmd/kiwiCreateArchive';
import { mainKiwiProvider } from '../../cmd/kiwiProvider';
import type { ProviderAppConfigInterface } from '../app/kiwiProvider/kiwiProvider.schema.gen';
import type { InventoryInterface } from '../components/inventory.schema.gen';
import { fsPromiseTmpDir, fsPromiseTmpFile, writeToTmpFile } from '../util/fs';
import { dumpYAML } from '../util/yaml';
import { RunnerDocker } from '../runners/docker';
import type { AssetsDistributionS3Interface } from '../assetsDistribution/s3/schema.gen';
import type { LogsStorageDirInterface } from '../logsStorage/dir/schema.gen';
import { getTestRunContext } from '../components/inventory.testutils';
import { testTimeoutLong, testTimeoutVeryLong } from '../util/constants';
import { promiseOrThrowOnTimeout } from '../util/timeout';
import type { ModuleHTTPInterface } from '../modules/http/schema.gen';
import type { AddressInfo } from 'node:net';
import { ModuleTry } from '../modules/try';
import { KiwiProviderListenerDefaultPort } from '../app/kiwiProvider/kiwiProvider.schema';
import { createNodeJSBundle } from '../commands/createNodeJSBundle';
import { NodeJSExecutableArch, NodeJSExecutablePlatform } from '../util/downloadNodeDist';
import { CommandCreateNodeJSBundleFormat } from '../commands/createNodeJSBundle.schema';
import { uploadDirToS3 } from '../util/s3';
import { testUtilRegisterRunner, testUtilRegisterServer, testUtilTearDown } from '../testutil/runner';
import type { TestUtilSpinUpS3EndpointResult } from '../testutil/s3';
import { testUtilSpinUpS3Endpoint } from '../testutil/s3';

const testAssetsDir = path.join(__dirname, 'test');
const testAssetsRunnersDir = path.join(__dirname, 'runners');

describe('e2e flow release', () => {
  afterEach(async () => {
    await testUtilTearDown();
  }, testTimeoutLong);

  const context = getTestRunContext();

  const s3PrefixArchive = 'archive';
  const s3PrefixAgent = 'agent';

  async function getTestArchive(context: RecipeCtorContext, s3: TestUtilSpinUpS3EndpointResult) {
    const archiveConfigFile = await fsPromiseTmpFile({
      keep: false,
      discardDescriptor: true,
    });

    // Set up the mock creds
    process.env['AWS_ACCESS_KEY_ID'] = s3.s3Username;
    process.env['AWS_SECRET_ACCESS_KEY'] = s3.s3Password;

    const archive = await mainKiwiCreateArchive([
      '--workDir',
      testAssetsDir,
      '--dump',
      archiveConfigFile,
      '--s3Bucket',
      s3.s3BucketName,
      '--s3Endpoint',
      s3.s3Endpoint,
      '--s3Prefix',
      s3PrefixArchive,
      '*.yaml',
    ]);

    // Unset the mock creds
    delete process.env['AWS_ACCESS_KEY_ID'];
    delete process.env['AWS_SECRET_ACCESS_KEY'];

    return {
      archive,
      archiveConfigFile,
    };
  }

  /**
   * What we need:
   *
   * - Create an archive
   * - Spin up the config kiwiProvider
   * - Spin up the kiwiAgent
   * - Trigger the release reload
   * - Verify all is good via reports
   */

  test(
    'release',
    async () => {
      const s3 = await testUtilSpinUpS3Endpoint(context);

      const agentOutDir = await fsPromiseTmpDir({ keep: false });
      await createNodeJSBundle(context, {
        entryPoint: path.join(__dirname, '..', '..', 'cmd', 'kiwiAgent.ts'),
        outDir: agentOutDir,
        nodePlatform: NodeJSExecutablePlatform.linux,
        nodeArch: NodeJSExecutableArch.x64,
        format: CommandCreateNodeJSBundleFormat.gz,
      });
      await uploadDirToS3(context, agentOutDir, s3.s3Client, s3.s3BucketName, s3PrefixAgent);

      const archive = await getTestArchive(context, s3);
      expect(archive.archiveConfigFile).not.toBeUndefined();

      /*
       * Gen config kiwiProvider config file
       */

      const inventory: InventoryInterface = {
        hosts: {
          'test-1': {},
        },
      };
      const inventoryFile = await writeToTmpFile(dumpYAML(inventory), {
        postfix: '.yaml',
      });
      const assetsDistributionS3: AssetsDistributionS3Interface = {
        bucket: s3.s3BucketName,
        endpoint: s3.s3Endpoint,
        endpointForClients: `http://host.docker.internal:${s3.portS3}`,
        credentials: {
          accessKeyId: s3.s3Username,
          secretAccessKey: s3.s3Password,
        },
        forcePathStyle: true,
      };
      const assetsDistributionS3Archive: AssetsDistributionS3Interface = {
        ...assetsDistributionS3,
        prefix: `${s3PrefixArchive}/${archive.archive.config.timestamp}`,
      };
      const assetsDistributionS3Agent: AssetsDistributionS3Interface = {
        ...assetsDistributionS3,
        prefix: s3PrefixAgent,
      };
      const logsStorageDir: LogsStorageDirInterface = {
        path: await fsPromiseTmpDir({ keep: false }),
      };
      const providerAppConfig: ProviderAppConfigInterface = {
        listener: {
          addr: '0.0.0.0',
          port: KiwiProviderListenerDefaultPort,
          // Specific for the test runner
          externalUrl: `http://host.docker.internal:${KiwiProviderListenerDefaultPort}`,
        },
        app: {
          inventoryPath: inventoryFile,
          archiveFile: archive.archiveConfigFile,
          assetsDistribution: {
            s3: assetsDistributionS3Archive,
          },
          logsStorage: {
            dir: logsStorageDir,
          },
          agentDistribution: {
            s3: assetsDistributionS3Agent,
          },
        },
      };
      const providerAppConfigFile = await writeToTmpFile(dumpYAML(providerAppConfig), {
        postfix: '.yaml',
      });

      const kiwiProvider = await mainKiwiProvider(['-vdebug', '--configFile', providerAppConfigFile]);
      testUtilRegisterServer(kiwiProvider);
      const kiwiProviderAddress = kiwiProvider.address() as AddressInfo;

      {
        const hcCall: ModuleHTTPInterface = {
          url: `http://127.0.0.1:${kiwiProviderAddress.port}/health`,
        };
        await promiseOrThrowOnTimeout(
          new ModuleTry({
            task: {
              http: hcCall,
            },
            retry: {},
          }).run(context),
          5000
        );
      }

      context.logger.info(`Provider is healthy all right!`);

      // Spin up a runner
      const runnerAgent = new RunnerDocker({
        dockerfile: {
          path: path.join(testAssetsRunnersDir, 'debian.Dockerfile'),
          context: testAssetsRunnersDir,
        },
        runArgs: ['--hostname', 'test-1'],
      });
      await runnerAgent.setUp(context, {
        skipKiwiSetup: true,
      });
      testUtilRegisterRunner(runnerAgent);

      // Make sure we can reach the host
      await runnerAgent.dockerExec(context, [
        'curl',
        '-fsS',
        `http://host.docker.internal:${kiwiProviderAddress.port}/health`,
      ]);
      // Install the agent via install script
      await runnerAgent.dockerExec(context, [
        'bash',
        '-c',
        `set -euo pipefail; curl -m5 -fsSo- "http://host.docker.internal:${kiwiProviderAddress.port}/bootstrap/agentDistribution/install.sh" | bash /dev/stdin`,
      ]);

      // Check installed version
      await runnerAgent.dockerExec(context, ['bash', '-ec', 'kiwi-agent version'], ['-e', 'BASH_ENV=$HOME/.bashrc']);
    },
    testTimeoutVeryLong
  );
});
