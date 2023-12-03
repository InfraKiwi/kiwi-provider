import { isPartOfESBuildBundle } from './build';
import * as os from 'node:os';
import path from 'node:path';

export const localhost = 'localhost';
export const hostnameSetLocalhost = new Set(['127.0.0.1', localhost, '::1']);

export const defaultCacheDir = isPartOfESBuildBundle
  ? path.join(os.homedir(), '.10InfraCache')
  : path.join(__dirname, '..', '..', '.cache');
