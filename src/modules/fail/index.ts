/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunContext } from '../../util/runContext';
import { ModuleFailSchema } from './schema';
import type { ModuleFailInterface } from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import { getErrorPrintfClass } from '../../util/error';

export const ModuleFailError = getErrorPrintfClass('ModuleFailError', 'Failed: %s');

export interface ModuleFailResult {}

export class ModuleFail extends AbstractModuleBase<ModuleFailInterface, ModuleFailResult> {
  async run(context: RunContext): Promise<ModuleRunResult<ModuleFailResult>> {
    const config: ModuleFailInterface = typeof this.config == 'string' ? { message: this.config } : this.config;

    const message = config.message ?? 'fail module called';

    return {
      failed: new ModuleFailError(message).toString(),
      changed: false,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleFailSchema, ModuleFail);
