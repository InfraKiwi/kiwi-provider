/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, expect, test } from '@jest/globals';
import { objectIsEmpty } from './object';

interface ObjectIsEmptyTest {
  args: object;
  expect: boolean;
}

describe('object utils', () => {
  const tests: ObjectIsEmptyTest[] = [
    {
      args: {},
      expect: true,
    },
    {
      args: { hey: 2 },
      expect: false,
    },
    {
      args: {
        hey: 2,
        waa: 5,
      },
      expect: false,
    },
  ];

  test.each(tests)('objectIsEmpty $#', async (t) => {
    const empty = objectIsEmpty(t.args);
    expect(empty).toEqual(t.expect);
  });
});
