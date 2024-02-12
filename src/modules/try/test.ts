/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, expect, test } from '@jest/globals';
import { ModuleTry } from './index';

import type { ModuleTryInterface, ModuleTryResultInterface } from './schema.gen';

import { getTestRunContext } from '../../components/inventory.testutils';
import { testExamples } from '../../util/testUtils';
import type { TaskInterface } from '../../components/task.schema.gen';

interface ModuleTryTest {
  args: ModuleTryInterface;
  expect: {
    fail?: boolean;
    result: ModuleTryResultInterface;
  };
}

describe('try module', () => {
  testExamples(__dirname);

  const failUntilThirdTryTask: TaskInterface[] = [
    {
      set: {
        retries: '${{ __retry }} retries',
      },
      out: 'set',
    },
    {
      debug: 'Retry index ${{ __retry }}',
      // Fail twice
      failedIf: '__retry < 2',
    },
  ];

  const tests: ModuleTryTest[] = [
    {
      args: {
        task: failUntilThirdTryTask,
        retry: {
          max: 2,
        },
      },
      expect: {
        result: {
          caught: false,
          retries: 2,
          vars: {
            set: {
              retries: '2 retries',
            },
          },
        },
      },
    },
  ];

  test.each(tests)('$#', async (t) => {
    const runContext = getTestRunContext();
    const module = new ModuleTry(t.args);

    const runPromise = module.run(runContext);
    if (t.expect.fail) {
      await expect(runPromise).rejects.toThrow();
    } else {
      const result = await runPromise;
      expect(result.vars).toEqual(t.expect.result);
    }
  });
});
