/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, expect, test } from '@jest/globals';
import { ModuleTry } from './index';

import type { ModuleTryInterface } from './schema.gen';

import { getTestRunContext } from '../../components/inventory.testutils';
import { testExamples } from '../../util/testUtils';
import type { VarsInterface } from '../../components/varsContainer.schema.gen';
import type { TaskInterface } from '../../components/task.schema.gen';
import { ModuleTryResultKeyRetries, ModuleTrySchema } from './schema';
import { joiMetaDelayTemplatesResolutionKey } from '../../util/tpl';
import { joiFindMetaValuePaths } from '../../util/joi';

interface ModuleTryTest {
  args: ModuleTryInterface;
  expect: {
    fail?: boolean;
    vars?: VarsInterface;
  };
}

describe('try module', () => {
  testExamples(__dirname);

  test('delay module resolution', () =>
    expect(
      joiFindMetaValuePaths(ModuleTrySchema.describe(), joiMetaDelayTemplatesResolutionKey, true)
    ).not.toBeUndefined());

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
        vars: {
          set: {
            retries: '2 retries',
          },
          [ModuleTryResultKeyRetries]: 2,
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
      expect(result.vars).toEqual(t.expect.vars);
    }
  });
});
