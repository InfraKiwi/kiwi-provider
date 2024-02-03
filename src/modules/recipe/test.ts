/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, expect, test } from '@jest/globals';
import { ModuleRecipe } from './index';
import type { ModuleRecipeInterface } from './schema.gen';
import path from 'node:path';
import type { VarsInterface } from '../../components/varsContainer.schema.gen';
import { Inventory } from '../../components/inventory';
import { getTestRunContext } from '../../components/inventory.testutils';
import type { ModuleRunResult } from '../abstractModuleBase';
import { RecipeSourceList } from '../../recipeSources/recipeSourceList';
import { testExamples } from '../../util/testUtils';

const testFolder = path.resolve(__dirname, 'test');

interface ModuleStoreTest {
  args: ModuleRecipeInterface;
  expect?: ModuleRunResult<VarsInterface>;
}

const testInventory = new Inventory({});

describe('recipe module', () => {
  testExamples(__dirname);

  const tests: ModuleStoreTest[] = [
    {
      args: { id: 'echo' },
      expect: {
        changed: false,
        vars: {
          set1: {
            hello: 'world',
          },
          set2: {
            hello2: 'world2',
          },
        },
      },
    },
    {
      args: 'echo',
      expect: {
        changed: false,
        vars: {
          set1: {
            hello: 'world',
          },
          set2: {
            hello2: 'world2',
          },
        },
      },
    },
    {
      args: 'exit',
      expect: {
        changed: false,
        vars: {
          set1: {
            hello: 'world',
          },
        },
      },
    },
  ];

  test.each(tests)('$#', async (t) => {
    let runContext = getTestRunContext();
    runContext = runContext.prependRecipeSourceList(new RecipeSourceList(runContext, [{ dir: { path: testFolder } }]));
    runContext.host.loadGroupNamesFromInventory(runContext, testInventory);

    const module = new ModuleRecipe(t.args);

    const result = await module.run(runContext);
    expect(result).toMatchSnapshot();
  });
});
