import { describe, expect, test } from '@jest/globals';
import { Inventory } from './inventory';
import type { HostSourceRawInterface } from '../hostSources/raw/schema.gen';
import type { InventoryGroupInterface } from './inventory.schema.gen';
import type { RecipeCtorContext } from './recipe';
import { Recipe } from './recipe';
import { groupNameAll, groupNameGrouped, groupNameUngrouped } from './inventory.schema';
import type { VarsInterface } from './varsContainer.schema.gen';
import { newLogger } from '../util/logger';
import { RunContext } from '../util/runContext';
import { RecipeSourceList } from '../recipeSources/recipeSourceList';
import path from 'node:path';
import { testRecipe } from '../util/testUtils';
import { testTimeoutLong } from '../util/constants';
import { newDebug } from '../util/debug';

const debug = newDebug(__filename);

const testDir = path.resolve(__dirname, 'test', 'recipe');

interface AggregateHostVarsTest {
  hostPattern: string;
  matchFn: (vars: VarsInterface) => boolean;
}

interface InputValidationTest {
  vars: VarsInterface;
  fail?: boolean;
}

const logger = newLogger();
const context: RecipeCtorContext = {
  logger,
  recipeSources: undefined,
  workDir: undefined,
};

const sourceListTest = new RecipeSourceList(context, [{ dir: { path: testDir } }]);

describe('recipe', () => {
  test('recipe sources chain', async () => {
    const rsl = new RecipeSourceList(context, [{ dir: { path: path.join(testDir, 'recipeSourceChainTest', 'source1') } },]);
    const recipe = await rsl.findAndLoadRecipe(context, 'recipe1', {});
    await testRecipe(context, recipe);
  });

  describe('inputs validation', () => {
    const tests: InputValidationTest[] = [
      { vars: { hello: 'hey' } },
      { vars: { world: 'hoo' } },
      {
        vars: { world: 123 },
        fail: true,
      },
    ];

    test.each(tests)('$#', async (t) => {
      const recipe = await sourceListTest.findAndLoadRecipe(context, 'inputs', {});

      try {
        await testRecipe(context, recipe, t.vars);
      } catch (ex) {
        if (t.fail) {
          expect(ex).toBeInstanceOf(Error);
        } else {
          throw ex;
        }
      }
    });
  });

  test(
    'it support testMocks',
    async () => {
      const recipe = await sourceListTest.findAndLoadRecipe(context, 'mocks', {});
      await testRecipe(context, recipe);
    },
    testTimeoutLong,
  );
});

describe('recipe aggregateHostVars', () => {
  let varCounter = 1;

  const rawHosts: HostSourceRawInterface = {
    'test-1.hello.io': { varHost1: varCounter++ },
    'test-2.hello.io': { varHost2: varCounter++ },
    'test-3.hello.io': { varHost3: varCounter++ },
    'test-4.hello.io': { varHost4: varCounter++ },
    'test-ungrouped.hello.io': { varHostUngrouped: varCounter++ },
    'test-6.hello.io': { varHost6: varCounter++ },
  };

  const groups: Record<string, InventoryGroupInterface> = {
    [groupNameAll]: { vars: { varGroupAll: varCounter++ } },
    [groupNameGrouped]: { vars: { varGroupGrouped: varCounter++ } },
    [groupNameUngrouped]: { vars: { varGroupUngrouped: varCounter++ } },
    group1: {
      pattern: ['~test-[12].*'],
      vars: { varGroup1: varCounter++ },
    },
    group2: {
      pattern: ['~test-[34].*'],
      vars: { varGroup2: varCounter++ },
    },
    groupMixed: {
      pattern: ['~test-[23].*'],
      vars: { varGroupMixed: varCounter++ },
    },
  };

  const recipe = new Recipe(
    context,
    {
      tasks: [{ debug: 'hello' }],
      groupVars: {
        group1: { varRecipeGroup1: varCounter++ },
        group2: { varRecipeGroup2: varCounter++ },
      },
      hostVars: {
        ['test-1.hello.io']: { varRecipeHost1: varCounter++ },
        ['test-2.hello.io']: { varRecipeHost2: varCounter++ },
        ['test-3.hello.io']: { varRecipeHost3: varCounter++ },
        ['test-4.hello.io']: { varRecipeHost4: varCounter++ },
      },
    },
    { fileName: '/myfakerecipe.yaml' },
  );

  const tests: AggregateHostVarsTest[] = [
    /*
     * inventory file or script group vars
     * Object.assign(vars, inventory.inventoryConfig.vars);
     */
    {
      hostPattern: 'test-1.hello.io',
      matchFn: (v) => v['varInventory'] != null,
    },

    /*
     * inventory group_vars/all
     * Object.assign(vars, inventory.inventoryConfig.groups?.[groupNameAll]);
     */
    {
      hostPattern: 'test-1.hello.io',
      matchFn: (v) => v['varGroupAll'] != null,
    },
    {
      hostPattern: 'test-1.hello.io',
      matchFn: (v) => v['varGroupGrouped'] != null,
    },
    {
      hostPattern: 'test-ungrouped.hello.io',
      matchFn: (v) => v['varGroupUngrouped'] != null,
    },
    {
      hostPattern: 'test-ungrouped.hello.io',
      matchFn: (v) => v['varGroupAll'] != null,
    },
    {
      hostPattern: 'test-ungrouped.hello.io',
      matchFn: (v) => v['varGroupGrouped'] == null,
    },

    /*
     * inventory group_vars/*
     * Object.assign(vars, inventory.aggregateGroupVarsForHost(host));
     */
    {
      hostPattern: 'test-1.hello.io',
      matchFn: (v) => v['varGroup1'] != null,
    },
    {
      hostPattern: 'test-3.hello.io',
      matchFn: (v) => v['varGroup2'] != null,
    },
    {
      hostPattern: 'test-2.hello.io',
      matchFn: (v) => v['varGroupMixed'] != null,
    },
    {
      hostPattern: 'test-3.hello.io',
      matchFn: (v) => v['varGroupMixed'] != null,
    },

    /*
     * playbook group_vars/*
     * Object.assign(vars, this.aggregateGroupVarsForHost(inventory, host));
     */
    {
      hostPattern: 'test-1.hello.io',
      matchFn: (v) => v['varRecipeGroup1'] != null,
    },
    {
      hostPattern: 'test-1.hello.io',
      matchFn: (v) => v['varRecipeGroup1'] != null,
    },

    /*
     * inventory host_vars/*
     * Object.assign(vars, await host.loadHostVarsFromSource());
     */
    {
      hostPattern: 'test-1.hello.io',
      matchFn: (v) => v['varHost1'] != null,
    },
    {
      hostPattern: 'test-2.hello.io',
      matchFn: (v) => v['varHost2'] != null,
    },
    {
      hostPattern: 'test-3.hello.io',
      matchFn: (v) => v['varHost3'] != null,
    },

    /*
     * playbook host_vars/*
     * Object.assign(vars, this.config.hostVars?.[host.meta.hostname]);
     */
    {
      hostPattern: 'test-1.hello.io',
      matchFn: (v) => v['varRecipeHost1'] != null,
    },
    {
      hostPattern: 'test-2.hello.io',
      matchFn: (v) => v['varRecipeHost2'] != null,
    },
    {
      hostPattern: 'test-3.hello.io',
      matchFn: (v) => v['varRecipeHost3'] != null,
    },
  ];

  test.each(tests)('$#', async (t) => {
    debug(`test ${t.hostPattern}: ${t.matchFn.toString()}`);

    const inventory = new Inventory({
      hostSources: [{ raw: rawHosts }],
      groups: groups,
      vars: { varInventory: varCounter++ },
    });
    inventory.throwOnHostNotMatched = true;
    await inventory.loadGroupsAndStubs(context);

    const hosts = inventory.getHostsByPattern(context, t.hostPattern);
    expect(Object.keys(hosts).length).toBeGreaterThan(0);
    for (const hostname in hosts) {
      const host = hosts[hostname];
      const runContext = new RunContext(host, context);

      const varsFromInventory = await inventory.aggregateBaseVarsForHost(context, host);
      const varsFromRecipe = await recipe.aggregateHostVars(runContext, host);

      const aggregated: VarsInterface = {
        ...varsFromInventory,
        ...varsFromRecipe,
      };

      expect(t.matchFn(aggregated)).toEqual(true);
    }
  });
});
