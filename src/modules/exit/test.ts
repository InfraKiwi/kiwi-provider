import { newDebug } from '../../util/debug';
import { describe, expect, test } from '@jest/globals';
import { ModuleExit } from './index';

import type { ModuleExitInterface } from './schema.gen';

import { getTestRunContext } from '../../components/inventory.testutils';

const debug = newDebug(__filename);

interface ModuleStoreTest {
  args: ModuleExitInterface;
  expectVars?: object;
}

describe('exit module', () => {
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
    const module = new ModuleExit(t.args);

    const result = await module.run(runContext);
    expect(result.exit).toEqual(true);

    if (t.expectVars) {
      expect(result.vars).toEqual(t.expectVars);
    }
  });
});
