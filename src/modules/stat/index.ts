/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunContext } from '../../util/runContext';
import { ModuleStatSchema } from './schema';
import type { ModuleStatInterface } from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import type fs from 'node:fs';
import { getErrorPrintfClass } from '../../util/error';
import { fsPromiseExists, fsPromiseLStat, fsPromiseStat } from '../../util/fs';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';

export interface ModuleStatResultStat {
  isFile: boolean;
  isDirectory: boolean;
  isBlockDevice: boolean;
  isCharacterDevice: boolean;
  isSymbolicLink: boolean;
  isFIFO: boolean;
  isSocket: boolean;
  dev: number;
  ino: number;
  mode: number;
  nlink: number;
  uid: number;
  gid: number;
  rdev: number;
  size: number;
  blksize: number;
  blocks: number;
  atimeMs: number;
  mtimeMs: number;
  ctimeMs: number;
  birthtimeMs: number;
  atime: Date;
  mtime: Date;
  ctime: Date;
  birthtime: Date;
}

const statFunctions = [
  'isFile',
  'isDirectory',
  'isBlockDevice',
  'isCharacterDevice',
  'isSymbolicLink',
  'isFIFO',
  'isSocket',
];

export interface ModuleStatResult {
  exists: boolean;
  stat?: ModuleStatResultStat;
}

export const ModuleStatErrorFileNotFound = getErrorPrintfClass('ModuleStatFileNotFound', 'Path not found: %s');

export class ModuleStat extends AbstractModuleBase<ModuleStatInterface, ModuleStatResult> {
  async run(context: RunContext): Promise<ModuleRunResult<ModuleStatResult>> {
    if (!(await fsPromiseExists(this.config.path))) {
      if (this.config.throw) {
        throw new ModuleStatErrorFileNotFound(this.config.path);
      }
      return {
        vars: { exists: false },
        changed: false,
      };
    }

    const stat = this.config.follow ? await fsPromiseStat(this.config.path) : await fsPromiseLStat(this.config.path);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extractedStat: ModuleStatResultStat = {} as any;

    for (const statKey in stat) {
      const el = stat[statKey as keyof fs.Stats];
      if (typeof el == 'function') {
        if (statFunctions.includes(statKey)) {
          Object.assign(extractedStat, { [statKey]: el.call(stat) });
        }
      } else {
        Object.assign(extractedStat, { [statKey]: el });
      }
    }

    const result = {
      exists: true,
      stat: extractedStat,
    };

    return {
      vars: result,
      changed: false,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleStatSchema, ModuleStat);
