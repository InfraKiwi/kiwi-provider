/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunContext } from '../../util/runContext';
import { ModuleExampleSchema } from './schema';
import type { ModuleExampleInterface } from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';

export interface ModuleExampleResult {
  newValue: string;
}

export class ModuleExample extends AbstractModuleBase<ModuleExampleInterface, ModuleExampleResult> {
  async run(context: RunContext): Promise<ModuleRunResult<ModuleExampleResult>> {
    const newValue = this.config.hello + '123';

    return {
      vars: { newValue },
      changed: true,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleExampleSchema, ModuleExample);
