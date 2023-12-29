/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunContext } from '../../util/runContext';
import { ModuleSetSchema } from './schema';
import type { ModuleSetInterface } from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';

export interface ModuleSetResult {}

export class ModuleSet extends AbstractModuleBase<ModuleSetInterface, ModuleSetResult> {
  async run(context: RunContext): Promise<ModuleRunResult<ModuleSetResult>> {
    return {
      vars: this.config,
      changed: false,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleSetSchema, ModuleSet);
