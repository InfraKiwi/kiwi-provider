import { Inventory } from '../components/inventory';
import { tryOrThrowAsync } from '../util/try';
import type { RecipeCtorContext } from '../components/recipe';
import { Recipe } from '../components/recipe';
import type { MyPartialRunContextOmit } from '../util/runContext';

import { runRecipe } from './runRecipe';
import { localhost } from '../util/constants';

export interface RunRecipeFromFileArgs {
  recipePath: string;
  hostname: string;

  inventoryPath?: string;

  runContextPartial?: Partial<MyPartialRunContextOmit>;
}

export async function runRecipeFromFile(
  context: RecipeCtorContext & Partial<MyPartialRunContextOmit>,
  args: RunRecipeFromFileArgs,
): Promise<void> {
  const inventory = args.inventoryPath ? await Inventory.fromFile(context, args.inventoryPath) : new Inventory({});

  // Load recipe
  const recipe = await tryOrThrowAsync(() => Recipe.fromPath(context, args.recipePath), 'Failed to load recipe');

  await runRecipe(context, {
    inventory,
    recipe,
    hostname: args.hostname ?? localhost,
    runContextPartial: args.runContextPartial,
  });
}
