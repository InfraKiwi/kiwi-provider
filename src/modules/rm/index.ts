/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunContext } from '../../util/runContext';
import { ModuleRmGlobSchema, ModuleRmSchema } from './schema';
import type { ModuleRmGlobInterface, ModuleRmInterface } from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import { fsPromiseRm } from '../../util/fs';
import { MultiDataSourceGlob } from '../../dataSources/glob';
import path from 'node:path';

export interface ModuleRmResult {}

export class ModuleRm extends AbstractModuleBase<ModuleRmInterface, ModuleRmResult> {
  async run(context: RunContext): Promise<ModuleRunResult<ModuleRmResult>> {
    const toRemove: string[] = Array.isArray(this.config.path) ? this.config.path : [this.config.path];

    for (const p of toRemove) {
      await fsPromiseRm(p, {
        force: this.config.force ?? false,
        recursive: this.config.recursive ?? false,
      });
    }

    return {
      vars: {},
      changed: true,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleRmSchema, ModuleRm);

export interface ModuleRmGlobResult {
  removed: string[];
}

export class ModuleRmGlob extends AbstractModuleBase<ModuleRmGlobInterface, ModuleRmGlobResult> {
  async run(context: RunContext): Promise<ModuleRunResult<ModuleRmGlobResult>> {
    const { recursive, ...rest } = this.config;

    const removed: string[] = [];

    const ds = new MultiDataSourceGlob(rest);
    const entries = await ds.listEntries(context);

    for await (const file of entries) {
      const fullPath = rest.workDir ? path.join(rest.workDir, file) : file;
      await fsPromiseRm(fullPath, {
        /*
         * We can expect that nested directories may disappear
         * if the sorting is not correct by chance
         */
        force: true,
        recursive: recursive ?? false,
      });
      removed.push(fullPath);
    }

    return {
      vars: {
        removed,
      },
      changed: true,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleRmGlobSchema, ModuleRmGlob);
