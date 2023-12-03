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

export enum NodeJSPlatform {
  win = 'win',
  linux = 'linux',
  darwin = 'darwin',
}

export function getCurrentNodeJSPlatform(): NodeJSPlatform {
  switch (process.platform) {
    case 'win32':
      return NodeJSPlatform.win;
    case 'darwin':
      return NodeJSPlatform.darwin;
    case 'linux':
      return NodeJSPlatform.linux;
  }
  throw new Error(`Unsupported NodeJS platform ${process.platform}`);
}

export enum NodeJSArch {
  x64 = 'x64',
  arm64 = 'arm64',
  armv7l = 'armv7l',
}

export function getCurrentNodeJSArch(): NodeJSArch {
  switch (process.arch) {
    case 'x64':
      return NodeJSArch.x64;
    case 'arm64':
      return NodeJSArch.arm64;
    case 'arm':
      return NodeJSArch.armv7l;
  }
  throw new Error(`Unsupported NodeJS arch ${process.arch}`);
}

export interface DownloadNodeDistArgs {
  platform: NodeJSPlatform;
  arch: NodeJSArch;
  cacheDir?: string;
  client?: Axios;
  unsigned?: boolean;
}

export async function downloadNodeDist(
  context: ContextLogger,
  { platform, arch, client, cacheDir, unsigned }: DownloadNodeDistArgs,
): Promise<string> {
  if (client == null) {
    client = axios.create({});
    addDefaultInterceptors(context, client, 'DownloadUnsignedNodeDist');
  }

  cacheDir ??= unsignedNodeDistCacheDirDefault;
  await mkdirp(cacheDir);

  const version = process.version;
  const unsignedPrefix = unsigned ? 'unsigned-' : '';
  const fileName = `node-${unsignedPrefix}${version}-${platform}-${arch}` + (platform == 'win' ? '.exe' : '');
  const downloadedFileName = path.join(cacheDir, fileName);

  if (await fsPromiseExists(downloadedFileName)) {
    return downloadedFileName;
  }

  const url = `${unsignedNodeDistBaseUrl}/${version}/${fileName}`;
  // E.g. https://github.com/10infra/node-unsigned/releases/download/v20.9.0/node-v20.9.0-darwin-arm64
  await downloadFile(url, downloadedFileName, client);

  return downloadedFileName;
}
