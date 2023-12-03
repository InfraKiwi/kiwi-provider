import { describe, expect, test } from '@jest/globals';
import { TemplateEval } from './templateEval';

interface TplTestEntry {
  str: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exp?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any;
}

describe('processes eval templates correctly', () => {
  const templates: TplTestEntry[] = [
    {
      str: `setResult(123)`,
      exp: 123,
    },
  ];

  test.each(templates)('%s', async (el) => {
    const extract = new TemplateEval(el.str);
    const rendered = await extract.render(el.context ?? { world: 'hey' });
    if (el.exp) {
      expect(rendered).toEqual(el.exp);
    }
  });
});
