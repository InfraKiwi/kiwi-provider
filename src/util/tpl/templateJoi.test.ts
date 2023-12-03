import { describe, expect, test } from '@jest/globals';
import { TemplateJoi } from './templateJoi';

interface TplTestEntry {
  str: string;
  val?: unknown;
  fail?: boolean;
}

describe('processes joi templates correctly', () => {
  const templates: TplTestEntry[] = [
    {
      str: `Joi.string()`,
      val: 'hello',
    },
    {
      str: `Joi.string()`,
      val: 123,
      fail: true,
    },
  ];

  test.each(templates)('%s', async (el) => {
    const extract = new TemplateJoi(el.str);
    const rendered = extract.render({});
    const valid = rendered.validate(el.val);

    if (el.fail) {
      expect(valid.error).toBeInstanceOf(Error);
    } else {
      expect(valid.error).toBe(undefined);
    }
  });
});
