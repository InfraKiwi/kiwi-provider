// Creates the SEA package
// https://nodejs.org/docs/latest-v20.x/api/single-executable-applications.html

import path from 'node:path';
import type { ContextLogger } from '../util/context';
import { execCmd } from '../util/exec';
import { fsPromiseCopyFile, fsPromiseReadFile, fsPromiseTmpDir, waitForWritable } from '../util/fs';
import { platformIsWin } from '../util/os';
import { inject } from 'postject';
import { platform } from 'node:os';
import process from 'node:process';
import type { NodeJSArch, NodeJSPlatform } from '../util/downloadNodeDist';
import { downloadNodeDist } from '../util/downloadNodeDist';

export interface CommandPkgArgs {
  seaConfigFile: string;
  seaBlobFile: string;
  nodePlatform: NodeJSPlatform;
  nodeArch: NodeJSArch;
}

export async function createNodeJSBundle(
  context: ContextLogger,
  { seaConfigFile, seaBlobFile, nodeArch, nodePlatform }: CommandPkgArgs,
) {
  // Generate blob
  await execCmd(context, process.execPath, ['--experimental-sea-config', seaConfigFile]);
  const seaBlob = await fsPromiseReadFile(seaBlobFile);

  const nodeBin = await downloadNodeDist(context, {
    platform: nodePlatform,
    arch: nodeArch,
    unsigned: true,
  });

  // Generate bin package
  const tmpDir = await fsPromiseTmpDir({});
  const tmpFile = path.join(tmpDir, 'bundle' + (platformIsWin ? '.exe' : ''));
  context.logger.info(`Generating binary at ${tmpFile}`);

  // Clone node.js executable
  await fsPromiseCopyFile(nodeBin, tmpFile);

  /*
  https://github.com/StefanScherer/dockerfiles-windows/blob/main/signtool/signtool

  docker run --rm -v C:/Users/stefan/Dropbox/MVP:C:/certs:ro -v C:$(pwd):C:/signing -w C:/signing \
  -e SIGNING_PASSWORD -e SIGNTOOL -e FILE=$1 mcr.microsoft.com/windows/servercore:ltsc2019 \
  powershell -command iex\(\$env:SIGNTOOL\)
   */

  // Inject data
  context.logger.info(`Injecting data`);
  await inject(tmpFile, 'NODE_SEA_BLOB', seaBlob, {
    sentinelFuse: 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2',
    machoSegmentName: platform() == 'darwin' ? 'NODE_SEA' : undefined,
  });

  // TODO sign binary somewhere
  // TODO sign binary somewhere
  // TODO sign binary somewhere
  // TODO sign binary somewhere
  await signBinary(context, tmpFile);

  await waitForWritable(tmpFile);

  // Test binary
  context.logger.info(`Testing binary`);
  const result = await execCmd(context, tmpFile, ['version']);
  context.logger.info(`Execution result`, { result, tmpFile });
}

export async function signBinary(context: ContextLogger, binaryPath: string) {
  // NOOP
  // TODO
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
}
