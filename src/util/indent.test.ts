/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { indentString } from './indent';

describe('indent', () => {
  const tests: {
    text: string;
    indent: number;
    expect: string;
  }[] = [
    {
      text: `
      Hello
      World
      `,
      indent: 2,
      expect: `
  Hello
  World
`,
    },
    {
      text: `
              //
              // ========= Available modules =========
              //
              // Only one of the following keys can be
      `,
      indent: 2,
      expect: `
  //
  // ========= Available modules =========
  //
  // Only one of the following keys can be
`,
    },
  ];

  test.each(tests)('%#', (t) => {
    expect(indentString(t.text, t.indent)).toEqual(t.expect);
  });
});
