/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, expect, test } from '@jest/globals';
import { evalCodeWithBuiltins, evalCodeSimple } from './eval';

interface CodeTest {
  simple?: boolean;
  code: string;
  context?: object;
  fail?: boolean | string;
  expect?: unknown;
}

describe('eval', () => {
  const codeTests: CodeTest[] = [
    {
      simple: true,
      code: `
      const hello = 'world';
      return hello
      `,
      expect: 'world',
    },
    {
      simple: false,
      code: `
      const hello = 'world';
      return hello
      `,
      expect: 'world',
    },
  ];

  test.each(codeTests)('$#', async (args: CodeTest) => {
    // noinspection ES6MissingAwait
    const promise = args.simple
      ? evalCodeSimple(args.code, args.context)
      : evalCodeWithBuiltins(args.code, args.context);

    if (args.fail) {
      try {
        await promise;
        expect(false).toBe(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (ex: any) {
        if (typeof args.fail == 'string') {
          expect(ex?.message ?? ex).toEqual(args.fail);
        }
      }
    } else {
      const result = await promise;

      if (args.expect) {
        expect(result).toEqual(args.expect);
      }
    }
  });
});
