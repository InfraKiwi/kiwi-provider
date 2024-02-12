/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import vm from 'node:vm';
import { fsPromiseReadFile } from './fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import type { VarsInterface } from '../components/varsContainer.schema.gen';
import { getOSInfo } from './os';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRequireFn(context?: Record<string, any>): (id: string) => any {
  const requireOnDemand = createRequire(context?.['__filename'] ?? __filename);
  return (id: string) => {
    return requireOnDemand(id);

    /*
     * try {
     *   return requireOnDemand(id);
     * } catch (ex) {
     *   const requireResolutionPaths = [
     *     ...(context?.['__dirname'] ? [context?.['__dirname']] : []),
     *     path.resolve(process.cwd(), 'node_modules'),
     *     path.resolve(process.execPath, 'node_modules'),
     *   ];
     *
     *   for (const p of requireResolutionPaths) {
     *     try {
     *       return requireOnDemand(path.resolve(p, id));
     *     } catch (ex) {
     *       // NOOP
     *     }
     *   }
     * }
     *
     * throw new Error(`required module ${id} not found`);
     */
  };
}

const evalBuiltins = {
  setTimeout,
  console,
  os: getOSInfo,
};

export async function evalCodeWithBuiltins<T>(code: string, context?: VarsInterface): Promise<T> {
  return evalCodeSimple(code, {
    ...evalBuiltins,
    require: getRequireFn(context),
    ...(context?.['__filename'] ? { __dirname: path.dirname(context?.['__filename']) } : {}),
    ...context,
  });
}

export async function evalCodeSimple<T>(code: string, context?: VarsInterface): Promise<T> {
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
  script.runInContext(vmContext, {
    breakOnSigint: true,
    displayErrors: true,
  });

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
  script.runInContext(vmContext, {
    breakOnSigint: true,
    displayErrors: true,
  });

  return result!;
}

export async function evalFile(fileName: string, context?: VarsInterface): Promise<unknown> {
  const code = await fsPromiseReadFile(fileName, { encoding: 'utf-8' });
  return evalCodeWithBuiltins(code, {
    __filename: fileName,
    ...context,
  });
}

// TODO figure out circular deps
