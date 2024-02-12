/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { isPartOfESBuildBundle } from './build';
import * as os from 'node:os';
import path from 'node:path';

export const localhost = 'localhost';
export const localhost127 = '127.0.0.1';
export const hostnameSetLocalhost = new Set(['127.0.0.1', localhost, '::1']);

export const defaultCacheDir = isPartOfESBuildBundle
  ? path.join(os.homedir(), '.KiwiCache')
  : path.join(__dirname, '..', '..', '.cache');

export function areWeTestingWithJest() {
  return process.env.JEST_WORKER_ID !== undefined;
}

export const testTimeoutLong = 60 * 1000;
export const testTimeoutVeryLong = 5 * 60 * 1000;

export const platformIsWin = process.platform === 'win32';
export const platformIsMacOS = process.platform === 'darwin';
export const platformNewLine = (platformIsWin ? '\r' : '') + '\n';

// Cache directory used e.g. to download esbuild binaries
export const globalCacheDir = path.join(
  (platformIsWin ? process.env.LOCALAPPDATA : process.env.HOME) ?? os.tmpdir(),
  '.kiwi'
);
