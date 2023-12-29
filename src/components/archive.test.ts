/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, test } from '@jest/globals';
import path from 'node:path';
import { Archive } from './archive';
import type { RecipeCtorContext } from './recipe';
import { Recipe } from './recipe';
import { newLogger } from '../util/logger';
import type { HostSourceContext } from '../hostSources/abstractHostSource';
import { glob } from 'glob';
import { fsPromiseTmpDir } from '../util/fs';
import { RecipeSourceList } from '../recipeSources/recipeSourceList';

const testDir = path.resolve(__dirname, 'test', 'archive');

const logger = newLogger();
const context: HostSourceContext = {
  logger,
  workDir: __dirname,
};

export const archiveTestRecipeKeyDebug = 'test_archive_rb_debug_yaml';

export async function getTestArchive(): Promise<Archive> {
  const recipeCtorContext: RecipeCtorContext = {
    ...context,
    recipeSources: new RecipeSourceList(context, [
      {
        dir: { path: testDir },
        trusted: true,
      },
    ]),
  };

  const archiveDir = await fsPromiseTmpDir({ keep: false });
  const recipePaths = await glob('rb-*.yaml', { cwd: testDir });
  const recipes = await Promise.all(recipePaths.map((p) => Recipe.fromPath(recipeCtorContext, path.join(testDir, p))));
  const archive = await Archive.create(recipeCtorContext, {
    archiveDir,
    recipes,
  });

  return archive;
}

describe('archive', () => {
  test('can create an archive', async () => {
    const archive = await getTestArchive();
    expect(Object.keys(archive.config.rootRecipes)).toContain(archiveTestRecipeKeyDebug);
  });
});
