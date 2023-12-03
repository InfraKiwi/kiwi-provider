import { Inventory } from '../components/inventory';
import type { MyPartialRunContextOmit, RunStatistics } from '../util/runContext';
import { newRunStatistics } from '../util/runContext';
import { Archive } from '../components/archive';
import { localhost } from '../util/constants';
import type { DataSourceContext } from '../dataSources/abstractDataSource';
import { runRecipe } from './runRecipe';
import { getErrorCauseChain } from '../util/error';

export interface RunRecipeFromArchiveArgs {
  hostname?: string;

  archiveDir: string;
  recipeIds: string[];
  inventoryPath?: string;

  throwOnRecipeFailure?: boolean;
}

export async function runRecipesFromArchive(
  context: DataSourceContext & Partial<MyPartialRunContextOmit>,
  args: RunRecipeFromArchiveArgs,
): Promise<Record<string, RunStatistics>> {
  const inventory = args.inventoryPath ? await Inventory.fromFile(context, args.inventoryPath) : new Inventory({});

  const archive = await Archive.fromDir(args.archiveDir);
  const recipes = await archive.getInstantiatedRootRecipes(context, false, args.recipeIds);

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
        throw ex;
      }

      if (ex instanceof Error) {
        context.logger.error(`Recipe execution failed`, { cause: getErrorCauseChain(ex) });
        break;
      }
    } finally {
      statistics.endTime = new Date().getTime();
      recipesStats[recipe.fullId!] = statistics;
    }
  }

  return recipesStats;
}
