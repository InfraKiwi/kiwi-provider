// Creates the SEA package
// https://nodejs.org/docs/latest-v20.x/api/single-executable-applications.html

import { fsPromiseCopyFile, fsPromiseReadFile, fsPromiseTmpDir, waitForWritable } from '../src/util/fs';
import { platformIsMacOS, platformIsWin } from '../src/util/os';
import { inject } from 'postject';
import path from 'node:path';
import { execCmd } from '../src/util/exec';
import { setupUncaughtHandler } from '../src/util/uncaught';
import { newLogger } from '../src/util/logger';
import type { ContextLogger } from '../src/util/context';
import { platform } from 'node:os';
import { lookpath } from 'lookpath';
import { promiseRetry } from '../src/util/promise';

const logger = newLogger();
setupUncaughtHandler(logger);

const seaConfigFile = path.join(__dirname, '..', 'sea-config.json');
const seaBlobFile = path.join(__dirname, '..', 'dist', 'sea.blob');

(async () => {
  const context: ContextLogger = { logger };

  // Generate blob
  await execCmd(context, process.execPath, ['--experimental-sea-config', seaConfigFile]);
  const seaBlob = await fsPromiseReadFile(seaBlobFile);

  // Generate bin package
  const tmpDir = await fsPromiseTmpDir({});
  const tmpFile = path.join(tmpDir, 'bundle' + (platformIsWin ? '.exe' : ''));
  logger.info(`Generating binary at ${tmpFile}`);

  // Clone node.js executable
  await fsPromiseCopyFile(process.execPath, tmpFile);

  if (platformIsWin) {
    // signtool remove /s hello.exe
    if (await lookpath('signtool')) {
      logger.info(`Removing signing (local signtool command)`);
      await execCmd(context, 'signtool', ['remove', '/s', tmpFile]);
    } else {
      const mountedDir = 'C:\\signing';
      const bundleFileInMountedVolume = `${mountedDir}\\${path.basename(tmpFile)}`;

      /*
      NOTE: if there are any troubles, remember to switch to Windows Containers!
      https://stackoverflow.com/a/57548944
       */
      logger.info(`Removing signing (via docker)`);

      // The retry exists because sometimes the file is marked as "in use"
      await promiseRetry(
        async () => {
          await execCmd(context, 'docker', [
            'run',
            '--rm',

            '-v',
            `${tmpDir}:${mountedDir}`,

            'cmaster11/windows-signtool:latest',

            'remove',
            '/s',
            bundleFileInMountedVolume,
          ]);
        },
        {
          maxRetries: 10,
          delayMs: 1000,
          onError: async (err, maxRetries) =>
            context.logger.debug(`Signing failed on retry, remaining ${maxRetries}`, { err }),
        },
      );
    }
  } else if (platformIsMacOS) {
    logger.info(`Removing signing (local codesign command)`);
    await execCmd(context, 'codesign', ['--remove-signature', tmpFile]);
  }
  /*
  https://github.com/StefanScherer/dockerfiles-windows/blob/main/signtool/signtool

  docker run --rm -v C:/Users/stefan/Dropbox/MVP:C:/certs:ro -v C:$(pwd):C:/signing -w C:/signing \
  -e SIGNING_PASSWORD -e SIGNTOOL -e FILE=$1 mcr.microsoft.com/windows/servercore:ltsc2019 \
  powershell -command iex\(\$env:SIGNTOOL\)
   */

  // Inject data
  logger.info(`Injecting data`);
  await inject(tmpFile, 'NODE_SEA_BLOB', seaBlob, {
    sentinelFuse: 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2',
    machoSegmentName: platform() == 'darwin' ? 'NODE_SEA' : undefined,
  });

  // TODO sign binary
  // logger.info(`Signing binary`);
  /*
  Sign the binary (macOS and Windows only):

  On macOS:
  codesign --sign - hello COPY
  On Windows (optional):
  A certificate needs to be present for this to work. However, the unsigned binary would still be runnable.

  signtool sign /fd SHA256 hello.exe
   */

  await waitForWritable(tmpFile);

  // Test binary
  logger.info(`Testing binary`);
  const result = await execCmd(context, tmpFile, ['version']);
  logger.info(`Execution result`, { result, tmpFile });
})();
