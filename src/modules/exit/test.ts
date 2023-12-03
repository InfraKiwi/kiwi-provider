import { describe, expect, test } from '@jest/globals';
import { ModuleExit } from './index';

import type { ModuleExitInterface } from './schema.gen';

import { getTestRunContext } from '../../components/inventory.testutils';
import { testExamples } from '../../util/testUtils';

interface ModuleStoreTest {
  args: ModuleExitInterface;
}

describe('exit module', () => {
  testExamples(__dirname);

  const tests: ModuleStoreTest[] = [{ args: { message: 'hello' } }];

  test.each(tests)('$#', async (t) => {
    const runContext = getTestRunContext();
    const module = new ModuleExit(t.args);

    const result = await module.run(runContext);
    expect(result.exit).toEqual(true);
  });
});
