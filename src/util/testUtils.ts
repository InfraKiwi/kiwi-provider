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
import { defaultLogger, newLogger } from './logger';
import fs from 'node:fs';
import { contextVarAssetsDir } from '../components/recipe.schema';
import { loadYAMLFromFile } from './yaml';
import { TestSuite } from '../components/testSuite';

export function testExamples(rootDir: string, timeout?: number) {
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
  const allFiles = getAllFilesSync(examplesDir, 0).filter((f) => ['.yaml', '.js', '.ts'].includes(path.extname(f)));

  describe('test examples', () => {
    test.each(allFiles)(
      'recipe %s',
      async (file) => {
        const recipe = await sourceList.findAndLoadRecipe(context, file, {});
        await testRecipe(context, recipe, { [contextVarAssetsDir]: assetsDir });
      },
      timeout ?? 20000
    );
  });
}

export function testSuitesExamples(rootDir: string, timeout?: number) {
  const examplesDir = path.join(rootDir, 'examples');
  if (!fs.existsSync(examplesDir)) {
    return;
  }

  // const assetsDir = path.join(examplesDir, 'assets');

  const context: RecipeCtorContext = {
    logger: newLogger(),
    recipeSources: undefined,
    workDir: examplesDir,
  };
  context.recipeSources = new RecipeSourceList(context, [{ dir: { path: examplesDir } }]);

  // Get only files directly in the main folder
  const allFiles = getAllFilesSync(examplesDir, 0).filter((f) => f.endsWith('.test.yaml'));

  describe('test suites examples', () => {
    test.concurrent.each(allFiles)(
      'test suite %s',
      async (fileName) => {
        const fullPath = path.join(examplesDir, fileName);
        const config = await loadYAMLFromFile(fullPath);
        const testSuite = new TestSuite(config, { fileName: fullPath });
        const result = await testSuite.run(context);
        context.logger.info('Test suite finished', {
          fileName: testSuite.meta?.fileName,
          result,
        });
        TestSuite.printTestSuiteResult(result);
        for (const testId of result.runOrder) {
          const testResults = result.testResults[testId];
          expect(testResults).not.toBeUndefined();
          for (const recipeId of testResults!.runOrder) {
            const result = testResults!.tests[recipeId];
            expect(result.failed).toBeFalsy();
          }
        }
      },
      timeout ?? 20000
    );
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

export function tryExpectResolves<T>(p: Promise<T>) {
  return expect(
    (async () => {
      try {
        return await p;
      } catch (ex) {
        defaultLogger.error('tryExpect exception', { ex });
        throw ex;
      }
    })()
    // eslint-disable-next-line jest/valid-expect
  ).resolves;
}
