import type { RunContext } from '../../util/runContext';
import { ModuleDebugSchema } from './schema';
import type { ModuleDebugInterface } from './schema.gen';
import { newDebug } from '../../util/debug';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';

const debug = newDebug(__filename);

export interface ModuleDebugResult {}

export class ModuleDebug extends AbstractModuleBase<ModuleDebugInterface, ModuleDebugResult> {
  protected get disableShortie(): boolean {
    return true;
  }

  async run(context: RunContext): Promise<ModuleRunResult<ModuleDebugResult>> {
    context.logger.info(`debug`, { debug: this.config });

    return {
      vars: this.config,
      changed: false,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleDebugSchema, ModuleDebug);
