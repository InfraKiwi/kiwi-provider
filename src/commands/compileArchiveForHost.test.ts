import { describe, test } from '@jest/globals';
import { Inventory } from '../components/inventory';
import { compileArchiveForHost } from './compileArchiveForHost';
import { newLogger } from '../util/logger';
import type { HostSourceContext } from '../hostSources/abstractHostSource';
import { archiveTestRecipeKeyDebug, getTestArchive } from '../components/archive.test';
import type { HostSourceRawInterface } from '../hostSources/raw/schema.gen';

const logger = newLogger();
const context: HostSourceContext = {
  logger,
  workDir: undefined,
};

describe('compileArchiveForHost', () => {
  test('creates an archive for a host that does not directly exist in the inventory', async () => {
    const archive = await getTestArchive();

    // Note: otherHosts includes debug-*
    const inventory = new Inventory({
      groups: {
        'debug-all': {
          pattern: 'debug-*',
          vars: { groupVar: 'debug' },
        },
        'debug-first': 'debug-1,debug-2',
        never: 'never*',
      },
      vars: { inventoryVar: 1 },
      hostSources: [{ raw: { 'debug-1': { hello: 'world' } } }],
    });
    await inventory.loadGroupsAndStubs(context);

    const compiledArchive = await compileArchiveForHost(context, {
      inventory,
      archive,
      hostname: 'neverexists-hello',
    });

    expect(Object.keys(compiledArchive.inventory.hostSources![0].raw as HostSourceRawInterface)).toContain(
      'neverexists-hello',
    );
    expect(Object.keys(compiledArchive.archive.rootRecipes)).toContain(archiveTestRecipeKeyDebug);
  });
});
