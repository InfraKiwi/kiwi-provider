import { newDebug } from '../../util/debug';
import { describe, expect, test } from '@jest/globals';
import { ModuleEval } from './index';

import { getTestRunContext } from '../../components/inventory.testutils';

const debug = newDebug(__filename);

interface CodeTest {
  code: string;
  fail?: boolean | string;
  expectVars?: object;
}

describe('eval module', () => {
  const codeTests: CodeTest[] = [
    {
      code: `
      result.vars.hello = 'World';
      `,
      expectVars: { hello: 'World' },
    },
    {
      code: `
      throw new Error('meh');
      `,
      fail: 'meh',
    },
    {
      code: `
      const p = new Promise((resolve) => {
        setTimeout(() => {
          resolve('booo');
        }, 1);
      });
      result.vars.hello = await p;
      `,
      expectVars: { hello: 'booo' },
    },
    {
      code: `
      const p = new Promise((res, rej) => {
        throw new Error('meh');
      });
      result.vars.hello = await p;
      `,
      fail: 'meh',
    },
    {
      code: `
      const p = new Promise((res, rej) => {
        rej(new Error('meh'));
      });
      result.vars.hello = await p;
      `,
      fail: 'meh',
    },
  ];

  test.each(codeTests)('$#', async (args: CodeTest) => {
    const runContext = getTestRunContext();

    const module = new ModuleEval({
      code: args.code,
    });

    const result = await module.run(runContext);

    if (args.fail) {
      expect(result.failed).toContain(args.fail);
    } else {
      expect(result.failed).toBeUndefined();
    }

    if (args.expectVars) {
      expect(result.vars).toEqual(args.expectVars);
    }
  });
});
