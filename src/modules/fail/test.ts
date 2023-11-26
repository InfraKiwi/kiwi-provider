import { newDebug } from '../../util/debug';
import { describe, expect, test } from '@jest/globals';
import { ModuleFail } from './index';

import type { ModuleFailInterface } from './schema.gen';

import { getTestRunContext } from '../../components/inventory.testutils';

const debug = newDebug(__filename);

interface ModuleStoreTest {
  args: ModuleFailInterface;
  expectVars?: object;
}

describe('fail module', () => {
  const tests: ModuleStoreTest[] = [
    {
      args: { message: 'hello' },
    },
    {
      args: { message: 'hello', vars: { myVar: 'world' } },
      expectVars: { myVar: 'world' },
    },
  ];

  test.each(tests)('$#', async (t) => {
    const runContext = getTestRunContext();
    const module = new ModuleFail(t.args);

    const result = await module.run(runContext);
    expect(result.failed).toContain('hello');

    if (t.expectVars) {
      expect(result.vars).toEqual(t.expectVars);
    }
  });
});
