/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { afterAll, describe, test } from '@jest/globals';
import type { RunnerLocal } from './index';
import type { ContextLogger } from '../../util/context';
import { newLogger } from '../../util/logger';
import type { TestSuiteInterface } from '../../components/testSuite.schema.gen';
import { TestSuite } from '../../components/testSuite';
import { testTimeoutLong } from '../../util/constants';
import { testExamples } from '../../util/testUtils';

const logger = newLogger();
const context: ContextLogger = { logger };

const allRunners = new Set<RunnerLocal>();
afterAll(async () => {
  for (const runner of allRunners) {
    await runner.tearDown(context);
  }
}, testTimeoutLong);

describe('local runner', () => {
  testExamples(__dirname);

  test(
    'it runs a simple test suite',
    async () => {
      const testSuiteConfig: TestSuiteInterface = {
        runner: { local: {} },
        tests: [
          {
            name: 'my_test',
            tasks: [{ debug: 'Hello' }],
          },
          {
            name: 'failing',
            tasks: [{ debug: 'I will soon fail' }, { fail: 'Buh!' }],
          },
        ],
      };

      const suite = new TestSuite(testSuiteConfig);
      const result = await suite.run(context);

      {
        const testResult = result.testResults['my_test']!;
        expect(testResult).not.toBeUndefined();
        expect(testResult.runOrder[0]).toEqual('my_test');
        expect(testResult.tests['my_test']).not.toBeUndefined();
        expect(testResult.tests['my_test'].processedTasksCount).toEqual(1);
        expect(testResult.tests['my_test'].totalTasksCount).toEqual(1);
        expect(testResult.tests['my_test'].failed).toEqual(false);
      }

      {
        const testResult = result.testResults['failing']!;
        expect(testResult).not.toBeUndefined();
        expect(testResult.tests['failing']).not.toBeUndefined();
        expect(testResult.tests['failing'].processedTasksCount).toEqual(1);
        expect(testResult.tests['failing'].totalTasksCount).toEqual(2);
        expect(testResult.tests['failing'].failed).toEqual(true);
      }
    },
    testTimeoutLong
  );
});
