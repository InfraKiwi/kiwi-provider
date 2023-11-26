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

  const debugFunction = <IDebugFunction>(Debug(DEBUG_KEY + key) as unknown);
  debugFunction.uncaught = logUncaught.bind(debugFunction);

  return debugFunction;
};

// eslint-disable-next-line @typescript-eslint/unbound-method
newDebug.enable = function (key) {
  if (key != null) {
    Debug.enable(key);
  } else {
    Debug.enable(DEBUG_KEY + '*');
  }
};

// eslint-disable-next-line @typescript-eslint/unbound-method
newDebug.disable = function () {
  Debug.enable('');
};
