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
