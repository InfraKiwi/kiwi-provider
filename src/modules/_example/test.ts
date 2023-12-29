/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, expect, test } from '@jest/globals';
import type { ModuleExampleResult } from './index';
import { ModuleExample } from './index';

import type { ModuleExampleInterface } from './schema.gen';

import { getTestRunContext } from '../../components/inventory.testutils';
import type { ModuleRunResult } from '../abstractModuleBase';
import { testExamples } from '../../util/testUtils';

interface ModuleStoreTest {
  args: ModuleExampleInterface;
  expect?: ModuleRunResult<ModuleExampleResult>;
}

describe('example module', () => {
  testExamples(__dirname);

  const tests: ModuleStoreTest[] = [
    {
      args: { hello: 'world' },
      expect: {
        vars: { newValue: 'world123' },
        changed: true,
      },
    },
  ];

  test.each(tests)('$#', async (t) => {
    const runContext = getTestRunContext();
    const module = new ModuleExample(t.args);

    await expect(module.run(runContext)).resolves.toEqual(t.expect);
  });
});
