import { isPartOfESBuildBundle } from './build';
import * as os from 'node:os';
import path from 'node:path';

export const localhost = 'localhost';
export const localhost127 = '127.0.0.1';
export const hostnameSetLocalhost = new Set(['127.0.0.1', localhost, '::1']);

export const defaultCacheDir = isPartOfESBuildBundle
  ? path.join(os.homedir(), '.10InfraCache')
  : path.join(__dirname, '..', '..', '.cache');

export function areWeTestingWithJest() {
  return process.env.JEST_WORKER_ID !== undefined;
}

export const testTimeoutLong = 60 * 1000;

export const platformIsWin = process.platform === 'win32';
export const platformIsMacOS = process.platform === 'darwin';
export const platformNewLine = (platformIsWin ? '\r' : '') + '\n';
