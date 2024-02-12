/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

/*
 * Creates the SEA package
 * https://nodejs.org/docs/latest-v20.x/api/single-executable-applications.html
 */

import type { ContextLogger } from '../util/context';
import { execCmd } from '../util/exec';
import {
  fsPromiseCopyFile,
  fsPromiseCp,
  fsPromiseReadFile,
  fsPromiseTmpDir,
  fsPromiseTmpFile,
  fsPromiseWriteFile,
  waitForWritable,
} from '../util/fs';
import { inject } from 'postject';
import process from 'node:process';
import { downloadNodeDist, NodeJSExecutablePlatform } from '../util/downloadNodeDist';
import { createCJSRunnerBundle } from '../util/createCJSRunnerBundle';
import path from 'node:path';
import { getNodeJSBundleFileName } from './createNodeJSBundle.helpers';
import type { CommandCreateNodeJSBundleArgs, fnSignatureCreateNodeJSBundle } from './createNodeJSBundle.schema';
import { CommandCreateNodeJSBundleFormat } from './createNodeJSBundle.schema';
import { createGz } from '../util/gz';

// NOTE: check for requireOnDemand usage before changing this fn name!
export const createNodeJSBundle: fnSignatureCreateNodeJSBundle = async (
  context: ContextLogger,
  { nodeArch, nodePlatform, outDir, bundleFileName, entryPoint, format }: CommandCreateNodeJSBundleArgs
): Promise<string> => {
  outDir ??= await fsPromiseTmpDir({ keep: false });

  // Generate blob
  const cjsBundle = await createCJSRunnerBundle(context, { entryPoint });

  const blobFile = await fsPromiseTmpFile({
    discardDescriptor: true,
    postfix: '.blob',
    keep: false,
  });
  const seaConfig = {
    main: cjsBundle,
    output: blobFile,
    disableExperimentalSEAWarning: true,
    useSnapshot: false,
    useCodeCache: false, // true
  };
  const seaConfigFile = await fsPromiseTmpFile({
    discardDescriptor: true,
    postfix: '.json',
    keep: false,
  });
  await fsPromiseWriteFile(seaConfigFile, JSON.stringify(seaConfig));

  await execCmd(context, process.execPath, ['--experimental-sea-config', seaConfigFile], { streamLogs: true });
  const seaBlob = await fsPromiseReadFile(blobFile);

  const nodeBin = await downloadNodeDist(context, {
    platform: nodePlatform,
    arch: nodeArch,
    unsigned: true,
  });

  // Generate bin package
  const entryPointName = path.basename(entryPoint, path.extname(entryPoint));
  bundleFileName ??= await getNodeJSBundleFileName(context, entryPointName, nodePlatform, nodeArch, format);

  const bundleFileTmp = await fsPromiseTmpFile({
    keep: false,
    discardDescriptor: true,
  });
  context.logger.info(`Generating binary at ${bundleFileTmp}`, { bundleFileName });

  // Clone node.js executable
  await fsPromiseCopyFile(nodeBin, bundleFileTmp);

  /*
   * https://github.com/StefanScherer/dockerfiles-windows/blob/main/signtool/signtool
   *
   * docker run --rm -v C:/Users/stefan/Dropbox/MVP:C:/certs:ro -v C:$(pwd):C:/signing -w C:/signing \
   * -e SIGNING_PASSWORD -e SIGNTOOL -e FILE=$1 mcr.microsoft.com/windows/servercore:ltsc2019 \
   * powershell -command iex\(\$env:SIGNTOOL\)
   */

  // Inject data
  context.logger.info('Injecting data');
  await inject(bundleFileTmp, 'NODE_SEA_BLOB', seaBlob, {
    sentinelFuse: 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2',
    machoSegmentName: nodePlatform == NodeJSExecutablePlatform.darwin ? 'NODE_SEA' : undefined,
  });

  /*
   * TODO sign binary somewhere
   * TODO sign binary somewhere
   * TODO sign binary somewhere
   * TODO sign binary somewhere
   */
  await signBinary(context, bundleFileTmp);

  await waitForWritable(bundleFileTmp);

  /*
   * Test binary
   * context.logger.info(`Testing binary`);
   * const result = await execCmd(context, tmpFile, ['version']);
   * context.logger.info(`Execution result`, { result, tmpFile });
   */

  const bundleFile = path.join(outDir, bundleFileName);

  switch (format) {
    case CommandCreateNodeJSBundleFormat.raw:
      await fsPromiseCp(bundleFileTmp, bundleFile);
      break;
    case CommandCreateNodeJSBundleFormat.gz:
      await createGz(bundleFileTmp, bundleFile);
      break;
  }

  return bundleFile;
};

export async function signBinary(context: ContextLogger, binaryPath: string) {
  /*
   * NOOP
   * TODO
   * TODO sign binary
   * logger.info(`Signing binary`);
   */
  /*
   * Sign the binary (macOS and Windows only):
   *
   * On macOS:
   * codesign --sign - hello COPY
   * On Windows (optional):
   * A certificate needs to be present for this to work. However, the unsigned binary would still be runnable.
   *
   * signtool sign /fd SHA256 hello.exe
   */
}
