/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { Axios } from 'axios';
import axios from 'axios';
import { addDefaultInterceptors } from './axios';
import type { ContextLogger } from './context';
import { mkdirp } from 'mkdirp';
import path from 'node:path';
import { downloadFile } from './download';
import { fsPromiseExists } from './fs';
import { defaultCacheDir } from './constants';

const unsignedNodeDistBaseUrl = 'https://github.com/10infra/node-unsigned/releases/download';
const unsignedNodeDistCacheDirDefault = path.join(defaultCacheDir, '.nodeBinCache');

/*
 * These constants are inline with Node.js binaries naming.
 * They should ONLY be used to deal with the Node.js executable.
 */

export enum NodeJSExecutablePlatform {
  win = 'win',
  linux = 'linux',
  darwin = 'darwin',
}

export function getCurrentNodeJSExecutablePlatform(): NodeJSExecutablePlatform {
  switch (process.platform) {
    case 'win32':
      return NodeJSExecutablePlatform.win;
    case 'darwin':
      return NodeJSExecutablePlatform.darwin;
    case 'linux':
      return NodeJSExecutablePlatform.linux;
  }
  throw new Error(`Unsupported NodeJS platform ${process.platform}`);
}

export enum NodeJSExecutableArch {
  x64 = 'x64',
  arm64 = 'arm64',
  armv7l = 'armv7l',
}

export function getCurrentNodeJSExecutableArch(): NodeJSExecutableArch {
  switch (process.arch) {
    case 'x64':
      return NodeJSExecutableArch.x64;
    case 'arm64':
      return NodeJSExecutableArch.arm64;
    case 'arm':
      return NodeJSExecutableArch.armv7l;
  }
  throw new Error(`Unsupported NodeJS arch ${process.arch}`);
}

export interface DownloadNodeDistArgs {
  platform: NodeJSExecutablePlatform;
  arch: NodeJSExecutableArch;
  cacheDir?: string;
  client?: Axios;
  unsigned?: boolean;
}

export async function downloadNodeDist(
  context: ContextLogger,
  { platform, arch, client, cacheDir = unsignedNodeDistCacheDirDefault, unsigned }: DownloadNodeDistArgs
): Promise<string> {
  if (client == null) {
    client = axios.create({});
    addDefaultInterceptors(context, client, 'DownloadUnsignedNodeDist');
  }

  await mkdirp(cacheDir);

  const version = process.version;
  const unsignedPrefix = unsigned ? 'unsigned-' : '';
  const fileName =
    `node-${unsignedPrefix}${version}-${platform}-${arch}` + (platform == NodeJSExecutablePlatform.win ? '.exe' : '');
  const downloadedFileName = path.join(cacheDir, fileName);

  if (await fsPromiseExists(downloadedFileName)) {
    return downloadedFileName;
  }

  const url = `${unsignedNodeDistBaseUrl}/${version}/${fileName}`;
  // E.g. https://github.com/10infra/node-unsigned/releases/download/v20.9.0/node-v20.9.0-darwin-arm64
  await downloadFile(url, downloadedFileName, client);

  return downloadedFileName;
}
