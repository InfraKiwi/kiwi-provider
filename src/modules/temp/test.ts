import { newDebug } from '../../util/debug';
import { describe, expect, test } from '@jest/globals';
import { ModuleTemp } from './index';

import type { ModuleTempInterface } from './schema.gen';
import { promisify } from 'node:util';
import fs from 'node:fs';

import { getTestRunContext } from '../../components/inventory.testutils';

const debug = newDebug(__filename);
const promiseExists = promisify(fs.exists);

interface ModuleStoreTest {
  args: ModuleTempInterface;
}

describe('temp module', () => {
  const tests: ModuleStoreTest[] = [
    { args: {} },
    { args: { keep: true } },
    { args: { prefix: 'hello-' } },
    { args: { extension: 'yaml' } },
  ];

  test.each(tests)('$#', async (t) => {
    const runContext = getTestRunContext();
    const module = new ModuleTemp(t.args);

    const result = await module.run(runContext);
    await expect(promiseExists(result.vars!.path)).resolves.toEqual(true);
  });
});
