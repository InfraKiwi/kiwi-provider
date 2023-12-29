/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, expect, test } from '@jest/globals';
import { ModuleFail } from './index';

import type { ModuleFailInterface } from './schema.gen';

import { getTestRunContext } from '../../components/inventory.testutils';
import { testExamples } from '../../util/testUtils';

interface ModuleStoreTest {
  args: ModuleFailInterface;
}

describe('fail module', () => {
  testExamples(__dirname);

  const tests: ModuleStoreTest[] = [{ args: { message: 'hello' } }];

  test.each(tests)('$#', async (t) => {
    const runContext = getTestRunContext();
    const module = new ModuleFail(t.args);

    const result = await module.run(runContext);
    expect(result.failed).toContain('hello');
  });
});
