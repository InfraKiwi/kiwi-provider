/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, expect, test } from '@jest/globals';
import type { ModuleTestResult } from './index';
import { ModuleTest, ModuleTestSilent } from './index';

import type { ModuleTestInterface } from './schema.gen';

import { getTestRunContext } from '../../components/inventory.testutils';
import type { ModuleRunResult } from '../abstractModuleBase';
import { testExamples } from '../../util/testUtils';

interface ModuleStoreTest {
  args: ModuleTestInterface;
  expect?: ModuleRunResult<ModuleTestResult>;
  expectFail?: boolean;
  useModuleSilent?: boolean;
}

describe('test module', () => {
  testExamples(__dirname);

  const runContext = getTestRunContext({
    vars: {
      num: 123,
      hello: 'world',
    },
  });

  const tests: ModuleStoreTest[] = [
    {
      args: 'num == 123',
      expect: {
        vars: { tests: { test: true } },
        changed: false,
      },
    },
    {
      args: ['num == 123', 'hello == \'world\''],
      expect: {
        vars: {
          tests: {
            test0: true,
            test1: true,
          },
        },
        changed: false,
      },
    },
    {
      args: { tests: { numTest: 'num == 123' } },
      expect: {
        vars: { tests: { numTest: true } },
        changed: false,
      },
    },
    {
      args: 'num == 124',
      expectFail: true,
    },
    {
      args: 'num == 124',
      expect: {
        vars: { tests: { test: false } },
        changed: false,
      },
      useModuleSilent: true,
    },
    {
      args: {
        tests: { numTest: 'num == 124' },
        silent: true,
      },
      expect: {
        vars: { tests: { numTest: false } },
        changed: false,
      },
    },
    {
      args: { numTest: 'num == 123' },
      expect: {
        vars: { tests: { numTest: true } },
        changed: false,
      },
    },
    {
      args: { numTest: 'num == 123' },
      expect: {
        vars: { tests: { numTest: true } },
        changed: false,
      },
      useModuleSilent: true,
    },
    {
      args: { numTest: 'num == 124' },
      expect: {
        vars: { tests: { numTest: false } },
        changed: false,
      },
      useModuleSilent: true,
    },
  ];

  test.each(tests)('$#', async (t) => {
    const module = t.useModuleSilent ? new ModuleTestSilent(t.args) : new ModuleTest(t.args);

    const promise = module.run(runContext);
    if (t.expectFail) {
      await expect(promise).rejects.toThrowError();
    } else {
      await expect(promise).resolves.toEqual(t.expect);
    }
  });
});
