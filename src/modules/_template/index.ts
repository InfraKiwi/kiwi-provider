/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunContext } from '../../util/runContext';
import { ModuleTemplateSchema } from './schema';
import type { ModuleTemplateInterface } from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';

export interface ModuleTemplateResult {
  newValue: string;
}

export class ModuleTemplate extends AbstractModuleBase<ModuleTemplateInterface, ModuleTemplateResult> {
  async run(context: RunContext): Promise<ModuleRunResult<ModuleTemplateResult>> {
    const newValue = this.config.hello + '123';

    return {
      vars: { newValue },
      changed: true,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleTemplateSchema, ModuleTemplate);
