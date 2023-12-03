import type { RunContext } from '../../util/runContext';
import { ModuleExitSchema } from './schema';
import type { ModuleExitInterface } from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';

export interface ModuleExitResult {}

export class ModuleExit extends AbstractModuleBase<ModuleExitInterface, ModuleExitResult> {
  async run(context: RunContext): Promise<ModuleRunResult<ModuleExitResult>> {
    const config: ModuleExitInterface = typeof this.config == 'string' ? { message: this.config } : this.config;

    context.logger.info(`Exiting: ${config.message ?? 'exit module invoked'}`);

    return {
      changed: false,
      exit: true,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleExitSchema, ModuleExit);
