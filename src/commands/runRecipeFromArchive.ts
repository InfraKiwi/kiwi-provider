/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { Inventory } from '../components/inventory';
import type { MyPartialRunContextOmit, RunStatistics } from '../util/runContext';
import { newRunStatistics } from '../util/runContext';
import type { Archive } from '../components/archive';
import { localhost } from '../util/constants';
import type { DataSourceContext } from '../dataSources/abstractDataSource';
import { runRecipe } from './runRecipe';
import { getErrorCauseChain } from '../util/error';

export interface RunRecipeFromArchiveArgs {
  hostname?: string;

  archive: Archive;
  recipeIds: string[];
  inventory?: Inventory;

  throwOnRecipeFailure?: boolean;
}

export async function runRecipesFromArchive(
  context: DataSourceContext & Partial<MyPartialRunContextOmit>,
  args: RunRecipeFromArchiveArgs
): Promise<Record<string, RunStatistics>> {
  const inventory = args.inventory ?? new Inventory({});
  const recipes = await args.archive.getInstantiatedRootRecipes(context, false, {
    ids: args.recipeIds,
  });

  const hostname = args.hostname ?? localhost;

  const recipesStats: Record<string, RunStatistics> = {};

  for (const recipe of recipes) {
    const statistics = newRunStatistics();
    try {
      await runRecipe(context, {
        hostname,
        inventory,
        recipe,
        runContextPartial: { statistics },
      });
    } catch (ex) {
      statistics.failed = true;

      if (args.throwOnRecipeFailure) {
        throw new Error(`Failed to run recipes from archive`, { cause: ex });
      }

      if (ex instanceof Error) {
        context.logger.error(`Recipe${recipe.config.name ? ` "${recipe.config.name}"` : ''} execution failed`, {
          cause: getErrorCauseChain(ex),
        });
        break;
      }
    } finally {
      statistics.endTime = new Date().getTime();
      recipesStats[recipe.fullId!] = statistics;
    }
  }

  return recipesStats;
}
