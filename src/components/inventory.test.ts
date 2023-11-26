import { newDebug } from '../util/debug';
import { describe, expect, test } from '@jest/globals';
import type { InventoryInterface } from './inventory.schema.gen';
import { Inventory } from './inventory';
import { naturalSortCompareFn } from '../util/sort';
import { groupNameAll, groupNameGrouped, groupNameUngrouped, groupRelationSelfKey } from './inventory.schema';
import type { HostSourceRawInterface } from '../hostSources/raw/schema.gen';
import { newLogger } from '../util/logger';
import type { HostSourceContext } from '../hostSources/abstractHostSource';
import { InventoryHost } from './inventoryHost';
import { deepcopy } from '../util/deepcopy';
import { InventoryEntryVarsRelationsKeyDefault } from './inventoryEntry.schema';

const debug = newDebug(__filename);
const logger = newLogger();
const context: HostSourceContext = {
  logger,
  workDir: undefined,
};

interface InventoryQueryTest {
  config?: InventoryInterface;
  query: string;
  expectedHostnames: string[];
}

describe('inventory - can get the right hosts in the right groups', () => {
  describe('query inventory for hosts', () => {
    const inventoryConfig: InventoryInterface = {
      hostSources: [
        {
          raw: {
            'test-1.hello.io': {},
            'test-2.hello.io': {},
            'test-3.hello.io': {},
            'test-4.hello.io': {},
            'another.hello.io': {},
            'another-2.hello.io': {},
            'test-another-3.hello.io': {},
            'omg.hello.io': {},
            ungroupedforever: {},
          },
        },
      ],
      groups: {
        'test-hosts': 'test-[1:3].hello.io',
        test: '*test*',
        another: '*another*',
        omg: 'omg*',
      },
    };

    const getInventory = () => new Inventory(deepcopy(inventoryConfig));
    const hostSourceRaw = inventoryConfig.hostSources![0].raw;
    const tests: InventoryQueryTest[] = [
      {
        query: 'test-hosts',
        expectedHostnames: ['test-1.hello.io', 'test-2.hello.io', 'test-3.hello.io'],
      },
      {
        query: 'test-hosts,omg',
        expectedHostnames: ['omg.hello.io', 'test-1.hello.io', 'test-2.hello.io', 'test-3.hello.io'],
      },
      {
        query: '!test-3.hello.io,test-hosts',
        expectedHostnames: ['test-1.hello.io', 'test-2.hello.io'],
      },
      {
        query: 'all,&test,&another',
        expectedHostnames: ['test-another-3.hello.io'],
      },
      {
        query: 'grouped',
        expectedHostnames: Object.keys(hostSourceRaw as HostSourceRawInterface).filter(
          (key) => key != 'ungroupedforever',
        ),
      },
      {
        query: 'all,!grouped',
        expectedHostnames: ['ungroupedforever'],
      },
      {
        query: 'all',
        expectedHostnames: Object.keys(hostSourceRaw as HostSourceRawInterface),
      },
    ];

    test.each(tests)('$query', async (args: InventoryQueryTest) => {
      const inventory = args.config ? new Inventory(args.config) : getInventory();
      await inventory.loadGroupsAndStubs(context);

      const hosts = inventory.getHostsByPattern(args.query);
      const hostnames = Object.keys(hosts);
      hostnames.sort(naturalSortCompareFn);
      args.expectedHostnames.sort(naturalSortCompareFn);
      expect(hostnames).toEqual(args.expectedHostnames);
    });

    test('fetch group names for hosts', async () => {
      const inventory = getInventory();
      await inventory.loadGroupsAndStubs(context);

      expect(inventory.getGroupNamesForHost(inventory.getRawHostObject('test-another-3.hello.io')!)).toEqual([
        'another',
        'test',
      ]);
      expect(
        inventory.getGroupNamesForHost(inventory.getRawHostObject('test-another-3.hello.io')!, undefined, true),
      ).toEqual([groupNameAll, 'another', groupNameGrouped, 'test'].sort(naturalSortCompareFn));
      expect(inventory.getGroupNamesForHost(inventory.getRawHostObject('ungroupedforever')!)).toEqual([]);
      expect(inventory.getGroupNamesForHost(inventory.getRawHostObject('ungroupedforever')!, undefined, true)).toEqual([
        groupNameAll,
        groupNameUngrouped,
      ]);
    });

    test('implicit host', async () => {
      // When querying an empty inventory with localhost, an empty host shall be returned, pointing to localhost
      const inventory = new Inventory({});
      await inventory.loadGroupsAndStubs(context);

      const hosts = inventory.getHostsByPattern('localhost');
      const hostnames = Object.keys(hosts);
      expect(hostnames).toEqual(['localhost']);
      expect(hosts[hostnames[0]]?.id).toEqual('localhost');
    });

    test('getRawSubInventoryConfig', async () => {
      const inventory = getInventory();
      await inventory.loadGroupsAndStubs(context);

      {
        const config = await inventory.createRawSubInventoryConfig(context, ['test-4.hello.io']);
        expect(Object.keys(config.groups!)).toContain('test');
      }

      inventory.setHost(new InventoryHost('test-5', {}));
      {
        const config = await inventory.createRawSubInventoryConfig(context, ['test-5']);
        expect(Object.keys(config.groups!)).toContain('test');
      }
    });
  });

  describe('relations', () => {
    const inventoryConfig: InventoryInterface = {
      hostSources: [
        {
          raw: {
            'rel-1': {
              [InventoryEntryVarsRelationsKeyDefault]: ['rel-2'],
            },
            // Belongs to relationsTest, which in turn has a relation to rel-1
            'rel-2': {},

            'rel-3': {
              [InventoryEntryVarsRelationsKeyDefault]: ['rel-*'],
            },
            'rel-4': {},

            'rel-another-1': {},
            'rel-another-2': {},
          },
        },
      ],
      groups: {
        relationsTest: {
          pattern: 'rel-[1:2]',
          relations: [groupRelationSelfKey],
        },
        relationsFromRel4: {
          pattern: 'rel-4',
          relations: ['rel-another-*'],
        },
      },
    };

    const getInventory = () => new Inventory(deepcopy(inventoryConfig));

    test('rel-1', async () => {
      const inventory = getInventory();
      await inventory.loadGroupsAndStubs(context);
      const config = await inventory.createRawSubInventoryConfig(context, ['rel-1']);
      expect(Object.keys(config.groups!)).toContain('relationsTest');
      const subInventory = new Inventory(config);
      await subInventory.loadGroupsAndStubs(context);
      expect(subInventory.getRawHostObject('rel-1')).not.toBeUndefined();
      expect(subInventory.getRawHostObject('rel-2')).not.toBeUndefined();
    });

    test('rel-2', async () => {
      const inventory = getInventory();
      await inventory.loadGroupsAndStubs(context);
      const config = await inventory.createRawSubInventoryConfig(context, ['rel-2']);
      const subInventory = new Inventory(config);
      await subInventory.loadGroupsAndStubs(context);
      expect(subInventory.getRawHostObject('rel-1')).not.toBeUndefined();
      expect(subInventory.getRawHostObject('rel-2')).not.toBeUndefined();
      expect(subInventory.getRawHostObject('rel-3')).toBeUndefined();
    });

    test('rel-3', async () => {
      const inventory = getInventory();
      await inventory.loadGroupsAndStubs(context);
      const config = await inventory.createRawSubInventoryConfig(context, ['rel-3']);
      const subInventory = new Inventory(config);
      await subInventory.loadGroupsAndStubs(context);
      expect(subInventory.getRawHostObject('rel-1')).not.toBeUndefined();
      expect(subInventory.getRawHostObject('rel-2')).not.toBeUndefined();
      expect(subInventory.getRawHostObject('rel-3')).not.toBeUndefined();
      expect(subInventory.getRawHostObject('rel-another-1')).not.toBeUndefined();
      expect(subInventory.getRawHostObject('rel-another-2')).not.toBeUndefined();
    });

    test('rel-4', async () => {
      const inventory = getInventory();
      await inventory.loadGroupsAndStubs(context);
      const config = await inventory.createRawSubInventoryConfig(context, ['rel-4']);
      expect(Object.keys(config.groups!)).toContain('relationsFromRel4');
      const subInventory = new Inventory(config);
      await subInventory.loadGroupsAndStubs(context);
      expect(subInventory.getRawHostObject('rel-1')).toBeUndefined();
      expect(subInventory.getRawHostObject('rel-2')).toBeUndefined();
      expect(subInventory.getRawHostObject('rel-3')).toBeUndefined();
      expect(subInventory.getRawHostObject('rel-another-1')).not.toBeUndefined();
      expect(subInventory.getRawHostObject('rel-another-2')).not.toBeUndefined();
    });
  });
});
