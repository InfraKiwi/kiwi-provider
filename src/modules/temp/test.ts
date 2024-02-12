/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, expect, test } from '@jest/globals';
import { ModuleTemp } from './index';

import type { ModuleTempInterface } from './schema.gen';
import { promisify } from 'node:util';
import fs from 'node:fs';

import { getTestRunContext } from '../../components/inventory.testutils';
import { testExamples } from '../../util/testUtils';

const promiseExists = promisify(fs.exists);

interface ModuleStoreTest {
  args: ModuleTempInterface;
}

describe('temp module', () => {
  testExamples(__dirname);

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
