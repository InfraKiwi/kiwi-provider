import { newDebug } from '../../util/debug';
import { describe, expect, test } from '@jest/globals';
import type { ModuleExampleResult } from './index';
import { ModuleExample } from './index';

import type { ModuleExampleInterface } from './schema.gen';

import { getTestRunContext } from '../../components/inventory.testutils';
import type { ModuleRunResult } from '../abstractModuleBase';

const debug = newDebug(__filename);

interface ModuleStoreTest {
  args: ModuleExampleInterface;
  expect?: ModuleRunResult<ModuleExampleResult>;
}

describe('example module', () => {
  const tests: ModuleStoreTest[] = [
    {
      args: { hello: 'world' },
      expect: { vars: { newValue: 'world123' }, changed: true },
    },
  ];

  test.each(tests)('$#', async (t) => {
    const runContext = getTestRunContext();
    const module = new ModuleExample(t.args);

    await expect(module.run(runContext)).resolves.toEqual(t.expect);
  });
});
