/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunContext } from '../../util/runContext';
import { ModuleMkdirSchema } from './schema';
import type { ModuleMkdirInterface } from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import { fsPromiseMkdir } from '../../util/fs';

export interface ModuleMkdirResult {
  path: string;
}

export class ModuleMkdir extends AbstractModuleBase<ModuleMkdirInterface, ModuleMkdirResult> {
  async run(context: RunContext): Promise<ModuleRunResult<ModuleMkdirResult>> {
    const result = await fsPromiseMkdir(this.config.path, { recursive: this.config.recursive });

    return {
      vars: { path: this.config.path },
      changed: result != undefined,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleMkdirSchema, ModuleMkdir);
