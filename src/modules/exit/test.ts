/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

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
