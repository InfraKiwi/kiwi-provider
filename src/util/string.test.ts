/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { asyncStringReplace } from './string';

describe('string utils', () => {
  describe('asyncStringReplace', () => {
    const tests: { str: string; regex: RegExp; replacer: (...matches: string[]) => Promise<string>; expect: string }[] =
      [
        {
          str: 'replace-a123-b345',
          regex: /\w(\d{3})/g,
          replacer: async (_g0, g1) => g1,
          expect: 'replace-123-345',
        },
      ];

    test.each(tests)('%p', async (t) => {
      expect(await asyncStringReplace(t.str, t.regex, t.replacer)).toEqual(t.expect);
    });
  });
});
