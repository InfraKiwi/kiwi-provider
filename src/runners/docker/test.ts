/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { afterAll, describe, test } from '@jest/globals';
import type { RunnerDocker } from './index';
import type { ContextLogger } from '../../util/context';
import { newLogger } from '../../util/logger';
import type { TestSuiteInterface } from '../../components/testSuite.schema.gen';
import { TestSuite } from '../../components/testSuite';
import { testTimeoutLong, testTimeoutVeryLong } from '../../util/constants';
import { testSuitesExamples } from '../../util/testUtils';

const logger = newLogger();
const context: ContextLogger = { logger };

const allRunners = new Set<RunnerDocker>();
afterAll(async () => {
  for (const runner of allRunners) {
    await runner.tearDown(context);
  }
}, testTimeoutLong);

describe('docker runner', () => {
  testSuitesExamples(__dirname, testTimeoutVeryLong);

  test(
    'it runs a simple test suite',
    async () => {
      const testSuiteConfig: TestSuiteInterface = {
        runner: { docker: { image: 'debian:bookworm' } },
        tests: [
          {
            name: 'my_test',
            tasks: [{ debug: 'Hello' }],
          },
        ],
      };

      const suite = new TestSuite(testSuiteConfig);
      const result = await suite.run(context, ['my_test']);

      const testResult = result.testResults['my_test']!;
      expect(testResult).not.toBeUndefined();
      expect(testResult.runOrder[0]).toEqual('my_test');
      expect(testResult.tests['my_test']).not.toBeUndefined();
      expect(testResult.tests['my_test'].processedTasksCount).toEqual(1);
      expect(testResult.tests['my_test'].totalTasksCount).toEqual(1);
    },
    testTimeoutVeryLong
  );
});
