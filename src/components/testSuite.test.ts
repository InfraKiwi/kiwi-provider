/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { test } from '@jest/globals';
import type { TestSuiteInterface } from './testSuite.schema.gen';
import { TestSuite } from './testSuite';
import { newLogger } from '../util/logger';
import type { HostSourceContext } from '../hostSources/abstractHostSource';

import { testTimeoutLong } from '../util/constants';

const logger = newLogger();
const context: HostSourceContext = {
  logger,
  workDir: __dirname,
};

describe('testing stack', () => {
  test(
    'it runs a simple test',
    async () => {
      const testSuiteConfig: TestSuiteInterface = {
        runner: { local: {} },
        tests: [
          {
            name: 'my_test',
            tasks: [{ debug: 'Hello' }],
          },
        ],
      };

      const suite = new TestSuite(testSuiteConfig);
      const result = await suite.run(context, ['my_test']);
      TestSuite.printTestSuiteResult(result);

      expect(result.runOrder).toEqual(['my_test']);
      const testResult = result.testResults['my_test']!;
      expect(testResult).not.toBeUndefined();
      expect(testResult.runOrder[0]).toEqual('my_test');
      expect(testResult.tests['my_test']).not.toBeUndefined();
      expect(testResult.tests['my_test'].processedTasksCount).toEqual(1);
      expect(testResult.tests['my_test'].totalTasksCount).toEqual(1);
    },
    testTimeoutLong
  );

  test(
    'it fails correctly',
    async () => {
      const testSuiteConfig: TestSuiteInterface = {
        runner: { local: {} },
        tests: [
          {
            name: 'fail_1',
            tasks: [{ fail: 'My custom error!' }],
          },

          {
            name: 'fail_2',
            tasks: [
              { set: { myVar: 'hello' } },
              {
                test: {
                  right: '__previousTaskResult.myVar == "hello"',
                  wrong: '__previousTaskResult.myVar != "hello"',
                },
              },
            ],
          },
        ],
      };

      const suite = new TestSuite(testSuiteConfig);
      const result = await suite.run(context);
      TestSuite.printTestSuiteResult(result);
      expect(result.runOrder).toEqual(['fail_1', 'fail_2']);

      {
        const testResult = result.testResults['fail_1']!;
        expect(testResult.tests['fail_1'].failed).toEqual(true);
        expect(testResult.tests['fail_1'].totalTasksCount).toEqual(1);
        expect(testResult.tests['fail_1'].processedTasksCount).toEqual(0);
      }

      {
        const testResult = result.testResults['fail_2']!;
        expect(testResult.tests['fail_2'].failed).toEqual(true);
        expect(testResult.tests['fail_2'].totalTasksCount).toEqual(2);
        expect(testResult.tests['fail_2'].processedTasksCount).toEqual(1);
      }
    },
    testTimeoutLong
  );

  describe('executes tests in independent runners if clean option is true', () => {
    const testSuiteConfig: TestSuiteInterface = {
      runner: { local: {} },
      clean: true,
      tests: [
        {
          name: 'test_1',
          tasks: [
            {
              write: {
                content: 'Hello',
                raw: true,
                // Stored in the temporary working directory
                path: 'tmpFile',
              },
            },
          ],
        },
        {
          name: 'test_2',
          tasks: [
            {
              stat: 'path=tmpFile',
              failedIf: {
                if: '__result.vars.exists',
                message: 'The file already exists!',
              },
            },
          ],
        },
      ],
    };

    // Forcefully disable clean
    test(
      'forcefully disable clean',
      async () => {
        const suite = new TestSuite({
          ...testSuiteConfig,
          clean: false,
        });
        const result = await suite.run(context);
        TestSuite.printTestSuiteResult(result);
        expect(result.runOrder).toEqual(['test_1', 'test_2']);
        const testResult = result.testResults['test_2']!;
        expect(testResult.tests['test_2'].failed).toEqual(true);
        expect(testResult.tests['test_2'].totalTasksCount).toEqual(1);
        expect(testResult.tests['test_2'].processedTasksCount, 'The test should fail forcefully').toEqual(0);
      },
      testTimeoutLong
    );

    test(
      'use clean',
      async () => {
        const suite = new TestSuite(testSuiteConfig);
        const result = await suite.run(context);
        TestSuite.printTestSuiteResult(result);
        expect(result.runOrder).toEqual(['test_1', 'test_2']);
        const testResult = result.testResults['test_2']!;
        expect(testResult.tests['test_2'].failed).toEqual(false);
        expect(
          testResult.tests['test_2'].processedTasksCount,
          'The test should succeed because we are using the clean option'
        ).toEqual(1);
      },
      testTimeoutLong
    );
  });
});
