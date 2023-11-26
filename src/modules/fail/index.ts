import type { RunContext } from '../../util/runContext';
import { ModuleFailSchema } from './schema';
import type { ModuleFailInterface } from './schema.gen';
import { newDebug } from '../../util/debug';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import { getErrorPrintfClass } from '../../util/error';

const debug = newDebug(__filename);
export const ModuleFailError = getErrorPrintfClass('ModuleFailError', 'Failed: %s');

export interface ModuleFailResult {}

export class ModuleFail extends AbstractModuleBase<ModuleFailInterface, ModuleFailResult> {
  async run(context: RunContext): Promise<ModuleRunResult<ModuleFailResult>> {
    const config: ModuleFailInterface =
      typeof this.config == 'string'
        ? {
            message: this.config,
          }
        : this.config;

    const message = config.message ?? 'fail module called';

    return {
      failed: new ModuleFailError(message).toString(),
      vars: config.vars,
      changed: false,
    };
  }

  get requiresMock(): boolean {
    return false;
  }

  protected get disableShortie(): boolean {
    return true;
  }
}

moduleRegistryEntryFactory.register(ModuleFailSchema, ModuleFail);
