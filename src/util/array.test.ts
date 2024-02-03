/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { expect, test } from '@jest/globals';
import { arraySubsetIterate } from './array';

describe('array utils', () => {
  describe('arraySubsetIterate', () => {
    const tests: { arr: string[]; len: number; it: (a: string[]) => boolean; expect: boolean }[] = [
      {
        arr: ['hello', 'world', '123'],
        len: 2,
        it: (a) => a[0] == 'world' && a[1] == '123',
        expect: true,
      },
      {
        arr: ['hello', 'world', '123'],
        len: 2,
        it: (a) => a[0] == 'world' && a[1] == '124',
        expect: false,
      },
    ];

    test.each(tests)('arraySubsetIterate $#', async (t) => {
      expect(arraySubsetIterate(t.arr, t.len, t.it)).toEqual(t.expect);
    });
  });
});
