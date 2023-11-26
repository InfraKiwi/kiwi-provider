import type { RunContext } from '../../util/runContext';
import { ModuleExitSchema } from './schema';
import type { ModuleExitInterface } from './schema.gen';
import { newDebug } from '../../util/debug';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';

const debug = newDebug(__filename);

export interface ModuleExitResult {}

export class ModuleExit extends AbstractModuleBase<ModuleExitInterface, ModuleExitResult> {
  async run(context: RunContext): Promise<ModuleRunResult<ModuleExitResult>> {
    const config: ModuleExitInterface =
      typeof this.config == 'string'
        ? {
            message: this.config,
          }
        : this.config;

    context.logger.info(`Exiting: ${config.message ?? 'exit module invoked'}`);

    return {
      vars: config.vars,
      changed: false,
      exit: true,
    };
  }

  get requiresMock(): boolean {
    return false;
  }

  protected get disableShortie(): boolean {
    return true;
  }
}

moduleRegistryEntryFactory.register(ModuleExitSchema, ModuleExit);
