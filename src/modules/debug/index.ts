/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunContext } from '../../util/runContext';
import { ModuleDebugSchema } from './schema';
import type { ModuleDebugInterface } from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';

export interface ModuleDebugResult {}

export class ModuleDebug extends AbstractModuleBase<ModuleDebugInterface, ModuleDebugResult> {
  async run(context: RunContext): Promise<ModuleRunResult<ModuleDebugResult>> {
    context.logger.info('debug', { debug: this.config });

    return {
      vars: this.config,
      changed: false,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleDebugSchema, ModuleDebug);
