import { describe, expect, test } from '@jest/globals';
import { extractAllTemplates, Template } from './tpl';

interface TplTestEntry {
  str: string;
  isTpl: boolean;
  exp?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any;
}

describe('processes templates correctly', () => {
  const templates: TplTestEntry[] = [
    {
      str: 'Hello ${{ getVars() }}',
      isTpl: true,
    },
    {
      str: 'Hello ${{ "${{ world }}" | tpl }}',
      isTpl: true,
      exp: 'Hello hey',
    },
    {
      str: 'Text: ${{ [__dirname, "test", "file.txt"] | join("/") | fileRead }}',
      isTpl: true,
      exp: 'Text: Hello text',
      context: { __dirname },
    },
    {
      str: 'File: ${{ [__dirname, "test", "eval.js"] | join("/") | evalFile }}',
      isTpl: true,
      exp: 'File: hey',
      context: { __dirname },
    },

    {
      str: 'Hello',
      isTpl: false,
    },
    {
      str: 'Hello {{ world }}',
      isTpl: false,
    },
    {
      str: 'Hello ${{ world }}',
      isTpl: true,
      exp: 'Hello hey',
    },
    {
      str: 'Hello ${{ world | upper }}',
      isTpl: true,
      exp: 'Hello HEY',
    },
  ];

  test.each(templates)('%s', async (el) => {
    const extract = extractAllTemplates(el.str);
    if (el.isTpl) {
      expect(extract).toBeInstanceOf(Template);
      const rendered = await (extract as Template).render(el.context ?? { world: 'hey' });
      if (el.exp) {
        expect(rendered).toEqual(el.exp);
      }
    } else {
      expect(extract).not.toBeInstanceOf(Template);
    }
  });
});
