/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunContext } from '../../util/runContext';
import { ModuleDebuggerSchema } from './schema';
import type { ModuleDebuggerInterface } from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';

export interface ModuleDebuggerResult {}

export class ModuleDebugger extends AbstractModuleBase<ModuleDebuggerInterface, ModuleDebuggerResult> {
  async run(context: RunContext): Promise<ModuleRunResult<ModuleDebuggerResult>> {
    if (this.config.enable) {
      context.logger.info('Sending debugger enable signal');
      process.kill(process.pid, 'SIGUSR1');
    } else {
      context.logger.info('Triggering debugger');
      // eslint-disable-next-line no-debugger
      debugger;
    }

    return {
      vars: {},
      changed: true,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleDebuggerSchema, ModuleDebugger);
