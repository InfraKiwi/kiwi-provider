import type { RunContext } from '../../util/runContext';
import { ModuleLoadSchema } from './schema';
import type { ModuleLoadInterface } from './schema.gen';
import { newDebug } from '../../util/debug';
import { moduleRegistryEntryFactory } from '../registry';
import type { VarsInterface } from '../../components/varsContainer.schema.gen';
import { VarsSource } from '../../components/varsSource';
import { resolveTemplates } from '../../util/tpl';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';

const debug = newDebug(__filename);

export interface ModuleLoadResult {}

export class ModuleLoad extends AbstractModuleBase<ModuleLoadInterface, ModuleLoadResult> {
  get requiresMock(): boolean {
    return false;
  }

  constructor(config: ModuleLoadInterface) {
    super(config);
  }

  #varsSources: VarsSource[] = Array.isArray(this.config)
    ? this.config.map((entry) => new VarsSource(entry))
    : [new VarsSource(this.config)];

  async run(context: RunContext): Promise<ModuleRunResult<ModuleLoadResult>> {
    const vars: VarsInterface = {};

    for (const varsSource of this.#varsSources) {
      let loadedVars = await varsSource.loadVars(context);
      if (!varsSource.config.raw) {
        loadedVars = await resolveTemplates(loadedVars, context.varsForTemplate);
      }
      Object.assign(vars, loadedVars);
      context = context.withVars(loadedVars);
    }

    return {
      vars,
      changed: false,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleLoadSchema, ModuleLoad);
