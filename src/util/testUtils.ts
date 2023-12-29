/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import path from 'node:path';
import { getAllFilesSync } from './fs';
import type { Recipe, RecipeCtorContext } from '../components/recipe';
import { type RecipeRunResult } from '../components/recipe';
import type { VarsInterface } from '../components/varsContainer.schema.gen';
import { getTestRunContext } from '../components/inventory.testutils';
import { Inventory } from '../components/inventory';
import { RecipeSourceList } from '../recipeSources/recipeSourceList';
import { test } from '@jest/globals';
import { newLogger } from './logger';
import fs from 'node:fs';
import { contextVarAssetsDir } from '../components/recipe.schema';

export function testExamples(rootDir: string) {
  const examplesDir = path.join(rootDir, 'examples');
  if (!fs.existsSync(examplesDir)) {
    return;
  }

  const assetsDir = path.join(examplesDir, 'assets');

  const context: RecipeCtorContext = {
    logger: newLogger(),
    recipeSources: undefined,
    workDir: examplesDir,
  };
  const sourceList = new RecipeSourceList(context, [{ dir: { path: examplesDir } }]);

  // Get only files directly in the main folder
  const allFiles = getAllFilesSync(examplesDir, 0).filter((f) => path.extname(f) == '.yaml');

  describe('test examples', () => {
    test.each(allFiles)('recipe %s', async (file) => {
      const recipe = await sourceList.findAndLoadRecipe(context, file, {});
      await testRecipe(context, recipe, { [contextVarAssetsDir]: assetsDir });
    });
  });
}

export async function testRecipe(
  context: RecipeCtorContext,
  recipe: Recipe,
  vars?: VarsInterface
): Promise<RecipeRunResult> {
  const runContext = getTestRunContext({
    ...context,
    isTesting: true,
    vars,
  });
  runContext.host.loadGroupNamesFromInventory(context, new Inventory({}));
  return await recipe.run(runContext);
}
