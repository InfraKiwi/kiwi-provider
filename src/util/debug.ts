/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Debug from 'debug';
import path from 'node:path';

const DEBUG_KEY = '10X:';

if (
  process.env.ENV !== 'prod' ||
  process.env.DEV_TOOLS === 'yes' ||
  (typeof window !== 'undefined' && self.location.search.indexOf('debug') > -1)
) {
  Debug.enable(DEBUG_KEY + '*');
} else {
  Debug.disable();
}

interface IDebugFunction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (...args: any[]): void;

  uncaught(err: Error): void;
}

interface INewDebug {
  (key: string): IDebugFunction;

  enable(key: string): void;

  disable(key: string): void;
}

const logUncaught = function (this: IDebugFunction, err: Error) {
  this('uncaught', err);
  throw err;
};

const prefixFreeDirName = path.resolve(__dirname, '..', '..');

export const newDebug: INewDebug = function (key: string) {
  if (key.indexOf(prefixFreeDirName) > -1) {
    key = key.replace(prefixFreeDirName, '');
  }

  const debugFunction = Debug(DEBUG_KEY + key) as unknown as IDebugFunction;
  debugFunction.uncaught = logUncaught.bind(debugFunction);

  return debugFunction;
};

newDebug.enable = function (key) {
  if (key != null) {
    Debug.enable(key);
  } else {
    Debug.enable(DEBUG_KEY + '*');
  }
};

newDebug.disable = function () {
  Debug.enable('');
};
