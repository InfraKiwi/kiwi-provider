/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { globalCacheDir, platformIsWin } from '../constants';
import path from 'node:path';
import { fsPromiseExists, fsPromiseMkdir, fsPromiseTmpFile } from '../fs';
import { getESBuildVersion } from '../package';
import { downloadFile } from '../download';
import axios from 'axios';
import { addDefaultInterceptors } from '../axios';
import type { ContextLogger } from '../context';
import { UnarchiveArchiveType, unarchiveFile } from '../unarchive';
import { execCmd } from '../exec';
import { createRequire } from 'node:module';

const requireOnDemand = createRequire(__filename);

/*
 * Follow NPM approach
 * Default: Windows: %LocalAppData%\npm-cache, Posix: ~/.npm
 */
const esBuildCacheDir = path.join(globalCacheDir, 'esbuild');

async function testESBuildBinaryVersion(context: ContextLogger, binPath: string, version: string) {
  const out = await execCmd(context, binPath, ['--version']);
  if (out.stdout.trim() != version) {
    throw new Error(`Mismatched ESBuild version. Expected ${version}, got ${out.stdout.trim()}`);
  }
}

// e.g. curl -O https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.19.11.tgz
async function ensureESBuild(context: ContextLogger): Promise<string> {
  const esBuildVersion = await getESBuildVersion();
  const esBuildVersionDir = path.join(esBuildCacheDir, `esbuild-${esBuildVersion}`);
  await fsPromiseMkdir(esBuildVersionDir, { recursive: true });

  /* Mirror the internal structure of the tar package */
  const esBuildBinaryFileName =
    path.join(
      'package',
      // Yeeeeeeeah https://github.com/evanw/esbuild/blob/a652e730ff07b9081470ef6965f3d54daa7b2aab/lib/npm/node-platform.ts#L62
      ...(platformIsWin ? ['esbuild'] : ['bin', 'esbuild'])
    ) + (platformIsWin ? '.exe' : '');
  const esBuildBinary = path.join(esBuildVersionDir, esBuildBinaryFileName);

  if (await fsPromiseExists(esBuildBinary)) {
    try {
      await testESBuildBinaryVersion(context, esBuildBinary, esBuildVersion);
      return esBuildBinary;
    } catch (ex) {
      context.logger.error(`Failed to check for ESBuild binary version, redownloading...`, { ex });
    }
  }

  // Download
  const tmpFile = await fsPromiseTmpFile({
    keep: false,
    discardDescriptor: true,
  });

  const client = axios.create({});
  addDefaultInterceptors(context, client, 'EnsureESBuild');
  const url = `https://registry.npmjs.org/@esbuild/${process.platform}-${process.arch}/-/${process.platform}-${process.arch}-${esBuildVersion}.tgz`;
  context.logger.info(`Downloading and extracting ESBuild package to cache`, {
    url,
    cache: esBuildBinary,
  });
  await downloadFile(url, tmpFile, client);

  // Extract
  await unarchiveFile(tmpFile, esBuildVersionDir, UnarchiveArchiveType['tar.gz']);

  // Test
  await testESBuildBinaryVersion(context, esBuildBinary, esBuildVersion);

  return esBuildBinary;
}

export async function generateESBuildBundleFromFile(context: ContextLogger, fileName: string) {
  const esBuildBin = await ensureESBuild(context);
  const tmpOut = await fsPromiseTmpFile({
    keep: false,
    discardDescriptor: true,
    postfix: '.js',
  });
  const out = await execCmd(
    context,
    esBuildBin,
    [
      '--bundle',
      `--outfile=${tmpOut}`,
      '--platform=node',
      // https://esbuild.github.io/api/#keep-names
      '--keep-names',
      '--format=cjs',
      fileName,
    ],
    {
      ignoreBadExitCode: true,
    }
  );
  context.logger.verbose(`ESBuild bundle result`, {
    outFile: tmpOut,
    out,
  });
  if (out.exitCode > 0) {
    throw new Error('Bad ESBuild exit code');
  }
  return tmpOut;
}

export async function generateAndLoadESBuildBundleFromFile(
  context: ContextLogger,
  fileName: string
): Promise<NodeRequire> {
  const bundleFileName = await generateESBuildBundleFromFile(context, fileName);
  const bundle = requireOnDemand(bundleFileName);
  return bundle;
}
