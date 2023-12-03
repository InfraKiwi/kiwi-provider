import type { RunContext } from '../../util/runContext';
import { ModuleExampleSchema } from './schema';
import type { ModuleExampleInterface } from './schema.gen';
import { newDebug } from '../../util/debug';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';

const debug = newDebug(__filename);

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
