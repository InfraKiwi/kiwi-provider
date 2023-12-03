import vm from 'node:vm';
import path from 'node:path';
import { fsPromiseReadFile } from './fs';
import { createRequire } from 'node:module';

const requireOnDemand = createRequire(__filename);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const requireFn = (id: string): any => {
  try {
    return requireOnDemand(id);
  } catch (ex) {
    const requireResolutionPaths = [
      path.resolve(process.cwd(), 'node_modules'),
      path.resolve(process.execPath, 'node_modules'),
    ];

    for (const p of requireResolutionPaths) {
      try {
        return requireOnDemand(path.resolve(p, id));
      } catch (ex) {
        // NOOP
      }
    }
  }

  throw new Error(`required module ${id} not found`);
};

const evalBuiltins = {
  setTimeout,
  console,
};

export async function evalCodeWithBuiltins<T>(code: string, context?: object): Promise<T> {
  return evalCodeSimple(code, {
    ...evalBuiltins,
    require: requireFn,
    ...context,
  });
}

export async function evalCodeSimple<T>(code: string, context?: object): Promise<T> {
  let outerPromise: Promise<unknown> | null = null;

  const vmContext = vm.createContext({
    ...context,
    ____setOuterPromise: (p: Promise<unknown>) => (outerPromise = p),
  });

  const asyncCode = `'use strict';
      async function ____topLevelFunctionAsync() { 
        ${code}
      }; 
      ____setOuterPromise(____topLevelFunctionAsync())`;

  const script = new vm.Script(asyncCode);
  script.runInContext(vmContext, { breakOnSigint: true, displayErrors: true });

  if (outerPromise == null) {
    throw new Error('unexpected state, null outer promise');
  }

  return outerPromise;
}

export function evalCodeSyncSimple<T>(code: string, context?: object): T {
  let result: T;

  const vmContext = vm.createContext({
    ...context,
    ____setResult: (p: T) => (result = p),
  });

  const asyncCode = `'use strict';
      function ____topLevelFunction() { 
        ${code}
      }; 
      ____setResult(____topLevelFunction())`;

  const script = new vm.Script(asyncCode);
  script.runInContext(vmContext, { breakOnSigint: true, displayErrors: true });

  return result!;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function evalFile(fileName: string, context?: any): Promise<any> {
  const code = await fsPromiseReadFile(fileName, { encoding: 'utf-8' });
  return evalCodeWithBuiltins(code, context);
}

// TODO figure out circular deps
