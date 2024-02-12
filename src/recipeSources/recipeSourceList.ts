/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { AbstractRecipeSourceInstance } from './abstractRecipeSource';
import { RecipeSourceListSchema } from './recipeSourceList.schema';
import type { RecipeSourceListInterface } from './recipeSourceList.schema.gen';
import type { Recipe, RecipeCtorContext } from '../components/recipe';
import { recipeSourceRegistry } from './registry';
import { RecipeSourceWrapperSchema } from './recipeSourceWrapper.schema';
import type { ContextLogger, ContextWorkDir } from '../util/context';
import { getErrorPrintfClass } from '../util/error';
import type { RecipeDependencyInterface } from '../components/recipe.schema.gen';
import type { RecipeSourceWrapperInterface } from './recipeSourceWrapper.schema.gen';
import type { DataSourceContext } from '../dataSources/abstractDataSource';
import { joiAttemptRequired } from '../util/joi';

export const RecipeSourceListErrorSourceNotFound = getErrorPrintfClass(
  'RecipeSourceListErrorSourceNotFound',
  'Failed to find recipe source: %s'
);
export const RecipeSourceListErrorRecipeNotFoundBySourceId = getErrorPrintfClass(
  'RecipeSourceListErrorRecipeNotFoundBySourceId',
  'Failed to find recipe in source with id %s: %s'
);
export const RecipeSourceListErrorRecipeNotFound = getErrorPrintfClass(
  'RecipeSourceListErrorRecipeNotFound',
  'Failed to find recipe: %s'
);

export interface RecipeSourceListCtorCache {
  sourcesByUniqueId: Record<string, AbstractRecipeSourceInstance>;
  sourcesById: Record<string, AbstractRecipeSourceInstance>;
}

export interface RecipeSourceCtorContext extends ContextLogger, ContextWorkDir {}

export class RecipeSourceList {
  readonly #config: RecipeSourceListInterface;
  readonly #sourceEntries: AbstractRecipeSourceInstance[];
  readonly #sourcesById: Record<string, AbstractRecipeSourceInstance>;
  readonly #sourcesByUniqueId: Record<string, AbstractRecipeSourceInstance>;

  constructor(
    context: RecipeSourceCtorContext,
    config: RecipeSourceListInterface,
    rawEntries: AbstractRecipeSourceInstance[] = []
  ) {
    // Make sure there are no sources with duplicate ids
    this.#config = joiAttemptRequired(config, RecipeSourceListSchema);

    this.#sourcesById = {};
    this.#sourcesByUniqueId = {};
    this.#sourceEntries = [];

    for (const entry of rawEntries) {
      this.#sourcesByUniqueId[entry.uniqueId] = entry;
      this.#sourcesById[entry.id] = entry;
    }

    const newEntries = this.#config.map((el) => {
      // Copy because we may overwrite some elements, like the workdir
      const elClone: RecipeSourceWrapperInterface = { ...el };
      // Always preset the workdir
      elClone.workDir ??= context.workDir;

      let source = recipeSourceRegistry.getRegistryEntryInstanceFromWrappedIndexedConfig<AbstractRecipeSourceInstance>(
        elClone,
        RecipeSourceWrapperSchema
      );
      const uniqueId = source.uniqueId;
      if (uniqueId in this.#sourcesByUniqueId) {
        // Reuse any previously created sources
        source = this.#sourcesByUniqueId[uniqueId];
      }
      return source;
    });

    const allEntries: AbstractRecipeSourceInstance[] = [...rawEntries, ...newEntries];

    this.#sourceEntries.push(
      ...allEntries.map((source) => {
        this.#sourcesByUniqueId[source.uniqueId] = source;

        if (source.id) {
          if (source.id in this.#sourcesById && this.#sourcesById[source.id] != source) {
            context.logger?.debug(`Redefining recipe source id '${source.id}'`, {
              from: this.#sourcesById[source.id].uniqueId,
              to: source.uniqueId,
            });
            // throw new Error(`Recipe source id '${el.id}' already defined`);
          }

          this.#sourcesById[source.id] = source;
        }
        return source;
      })
    );
  }

  getSourceById(id: string): AbstractRecipeSourceInstance | undefined {
    return this.#sourceEntries.find((s) => s.id == id);
  }

  cloneAndStopPropagation(context: RecipeSourceCtorContext): RecipeSourceList {
    return new RecipeSourceList(
      context,
      [],
      this.#sourceEntries.filter((s) => s.canPropagate)
    );
  }

  async findSourceForRecipe(
    context: DataSourceContext,
    id: string,
    dependencyArg: RecipeDependencyInterface
  ): Promise<AbstractRecipeSourceInstance> {
    // TODO support versioning

    if (dependencyArg.sourceId) {
      const source = this.getSourceById(dependencyArg.sourceId);
      if (source == null) {
        throw new RecipeSourceListErrorSourceNotFound(dependencyArg.sourceId);
      }
      if (await source.has(context, id)) {
        return source;
      }
      throw new RecipeSourceListErrorRecipeNotFoundBySourceId(dependencyArg.sourceId, id);
    }

    for (const entry of this.#sourceEntries) {
      if (await entry.has(context, id)) {
        return entry;
      }
    }
    throw new RecipeSourceListErrorRecipeNotFound(id);
  }

  async findAndLoadRecipe(
    context: RecipeCtorContext,
    id: string,
    dependencyArg: RecipeDependencyInterface
  ): Promise<Recipe> {
    // TODO support versioning
    context = {
      ...context,
      recipeSources: RecipeSourceList.mergePrepend(context, this, context.recipeSources)
        // We always need to stop propagating sources that were e.g. temporary
        ?.cloneAndStopPropagation(context),
    };

    if (dependencyArg.sourceId) {
      context.logger.debug(`RecipeSourceList/findAndLoad: ${id} from forced source ${dependencyArg.sourceId}`);

      const source = this.getSourceById(dependencyArg.sourceId);
      if (source == null) {
        throw new RecipeSourceListErrorSourceNotFound(dependencyArg.sourceId);
      }
      if (!(await source.has(context, id))) {
        throw new RecipeSourceListErrorRecipeNotFoundBySourceId(dependencyArg.sourceId, id);
      }
      return await source.load(context, id);
    }

    for (const entry of this.#sourceEntries) {
      if (await entry.has(context, id)) {
        context.logger.debug(`RecipeSourceList/findAndLoad: ${id} from source ${entry.uniqueId}`);
        return await entry.load(context, id);
      }
    }
    throw new RecipeSourceListErrorRecipeNotFound(id);
  }

  static mergePrepend(
    context: RecipeSourceCtorContext,
    entry: RecipeSourceList,
    to: RecipeSourceList | undefined
  ): RecipeSourceList | undefined {
    if (to == null) {
      return entry;
    }

    if (entry.#sourceEntries.length == 0) {
      if (to.#sourceEntries.length == 0) {
        return;
      }
      return to;
    }

    const newList = new RecipeSourceList(
      context,
      [],
      Array.from(new Set([...entry.#sourceEntries, ...to.#sourceEntries]))
    );
    return newList;
  }
}
