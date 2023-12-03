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
            label: 'my_test',
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
    testTimeoutLong,
  );
});
