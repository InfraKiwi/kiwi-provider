/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, expect, it, test } from '@jest/globals';
import { Task, TaskErrorFailedWithIfCondition } from './task';
import type { TaskInterface } from './task.schema.gen';
import Transport from 'winston-transport';
import { loggingMaskedPlaceholder } from '../util/logger';
import { getTestRunContext } from './inventory.testutils';
import type { ModuleFailInterface } from '../modules/fail/schema.gen';
import type { ModuleSetInterface } from '../modules/set/schema.gen';

interface FailTest {
  fail: ModuleFailInterface;
  failedIf: string | boolean;
  expectFail: boolean;
}

interface ExitTest {
  set: ModuleSetInterface;
  exitIf: string;
  expectExit: boolean;
}

describe('task', () => {
  it('should run a basic task', async () => {
    const taskConfig: TaskInterface = { set: { myVar: true } };

    const task = new Task(taskConfig);
    const result = await task.run(getTestRunContext());
    expect(result.moduleRunResult?.vars).toEqual(taskConfig.set);
  });

  it('should accept an if template', async () => {
    const taskConfigTrue: TaskInterface = {
      set: { myVar: true },
      if: 'true',
    };
    const taskConfigFalse: TaskInterface = {
      set: { myVar: true },
      if: 'false',
    };

    {
      const task = new Task(taskConfigTrue);
      const result = await task.run(getTestRunContext());
      expect(result.moduleRunResult?.vars).toEqual(taskConfigTrue.set);
    }
    {
      const task = new Task(taskConfigFalse);
      const result = await task.run(getTestRunContext());
      expect(result.skipped).toEqual(true);
    }
  });

  const failTests: FailTest[] = [
    {
      fail: {},
      failedIf: 'true',
      expectFail: true,
    },
    {
      fail: {},
      failedIf: 'false',
      expectFail: false,
    },
    {
      fail: {},
      failedIf: false,
      expectFail: false,
    },
  ];

  test.each(failTests)('fail test %#', async (test) => {
    const task = new Task({
      fail: test.fail,
      failedIf: test.failedIf,
    });

    const p = task.run(getTestRunContext());
    if (test.expectFail) {
      await expect(p).rejects.toThrowError(TaskErrorFailedWithIfCondition);
    } else {
      await expect(p).resolves.not.toBeUndefined();
    }
  });

  const exitTests: ExitTest[] = [
    {
      set: { iShouldExit: true },
      exitIf: '__result.vars.iShouldExit == true',
      expectExit: true,
    },
    {
      set: { iShouldExit: false },
      exitIf: '__result.vars.iShouldExit == true',
      expectExit: false,
    },
  ];

  test.each(exitTests)('exit test %#', async (test) => {
    const task = new Task({
      set: test.set,
      exitIf: test.exitIf,
    });

    const result = await task.run(getTestRunContext());
    if (test.expectExit) {
      expect(result.moduleRunResult?.exit).toEqual(true);
    } else {
      expect(result.moduleRunResult?.exit).toBeUndefined();
    }
  });

  it('should accept an out variable', async () => {
    const taskConfig: TaskInterface = {
      set: { myVar: true },
      out: '${{ myVarOut }}',
    };

    const runContext = getTestRunContext({ vars: { myVarOut: 'output' } });

    const task = new Task(taskConfig);
    const result = await task.run(runContext);

    expect(result.out).toEqual('output');
    expect(result.moduleRunResult!.vars).toEqual(taskConfig.set);
  });

  it('should accept the sensitive arg', async () => {
    let context = getTestRunContext({ vars: { myVarOut: 'output' } });

    {
      const taskConfig: TaskInterface = {
        set: { myVar: 'ohhhh' },
        sensitive: true,
        out: 'set',
      };
      const task = new Task(taskConfig);
      const taskRunResult = await task.run(context);
      expect(taskRunResult.moduleRunResult?.vars).toEqual({ myVar: loggingMaskedPlaceholder });

      context = context.withVars({ [taskRunResult.out!]: taskRunResult.moduleRunResult?.vars ?? {} });
    }

    {
      const tLines: { debug: string }[] = [];

      class DebuggingTransport extends Transport {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        log(info: any, next: () => void): any {
          setImmediate(() => {
            this.emit('logged', info);
          });
          if ('debug' in info) {
            tLines.push(info);
          }
          next();
        }
      }

      const t = new DebuggingTransport();
      context.logger.add(t);

      const taskConfig: TaskInterface = { debug: 'Hello ${{ set.myVar }}' };
      const task = new Task(taskConfig);
      await task.run(context);
      context.logger.remove(t);

      for (const tLine of tLines) {
        expect(tLine.debug).toEqual('Hello [MASKED]');
      }
    }
  });

  it('should ignore some templates', async () => {
    const taskConfig: TaskInterface = {
      test: 'hello == "Another {% raw %}${{ template }}{% endraw %}!"',
    };

    const runContext = getTestRunContext({ vars: { hello: 'Another ${{ template }}!' } });

    const task = new Task(taskConfig);
    await task.run(runContext);
  });

  it('should preserve the previous task result', async () => {
    const tasks: TaskInterface[] = [
      {
        set: { myVar: 'hello' },
      },
      {
        test: '${{ __previousTaskResult.vars.myVar == "hello" }}',
      },
    ];

    const runContext = getTestRunContext();

    // Should not fail
    await Task.runTasksInContext(
      runContext,
      tasks.map((t) => new Task(t))
    );
  });
});
