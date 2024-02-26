/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunContext } from '../../util/runContext';
import { ModuleLoadSchema } from './schema';
import type { ModuleLoadInterface } from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import type { VarsInterface } from '../../components/varsContainer.schema.gen';
import { VarsSource } from '../../components/varsSource';
import { resolveTemplates } from '../../util/tpl';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import { getArrayFromSingleOrArray } from '../../util/array';

export interface ModuleLoadResult {}

export class ModuleLoad extends AbstractModuleBase<ModuleLoadInterface, ModuleLoadResult> {
  constructor(config: ModuleLoadInterface) {
    super(config);
  }

  #varsSources: VarsSource[] = getArrayFromSingleOrArray(this.config).map((entry) => new VarsSource(entry));

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
