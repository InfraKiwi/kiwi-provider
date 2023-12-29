/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunContext } from '../../util/runContext';
import { ModuleRecipeSchema } from './schema';
import type { ModuleRecipeFullInterface, ModuleRecipeInterface } from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import { tryOrThrowAsync } from '../../util/try';
import type { Recipe } from '../../components/recipe';
import type { VarsInterface } from '../../components/varsContainer.schema.gen';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import { getErrorPrintfClass } from '../../util/error';

export const ModuleRecipeErrorRecipeSourcesNotDefined = getErrorPrintfClass(
  'ModuleRecipeErrorRecipeSourcesNotDefined',
  'No recipe sources defined'
);

export class ModuleRecipe extends AbstractModuleBase<ModuleRecipeInterface, VarsInterface> {
  get fullConfig(): ModuleRecipeFullInterface {
    return typeof this.config == 'string' ? { id: this.config } : this.config;
  }

  get label(): string | undefined {
    return this.fullConfig.id;
  }

  async #loadRecipe(context: RunContext): Promise<Recipe> {
    const { id, ...rest } = this.fullConfig;
    if (context.recipeSources == null) {
      throw new ModuleRecipeErrorRecipeSourcesNotDefined();
    }
    return await context.recipeSources.findAndLoadRecipe(context, id, rest);
  }

  async run(context: RunContext): Promise<ModuleRunResult<VarsInterface>> {
    const recipe = await this.#loadRecipe(context);

    const runResult = await tryOrThrowAsync(() => recipe.run(context), `Failed running recipe: ${this.fullConfig.id}`);

    return {
      vars: runResult.vars,
      changed: runResult.changed,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleRecipeSchema, ModuleRecipe);
