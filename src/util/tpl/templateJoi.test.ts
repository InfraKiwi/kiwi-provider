/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

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
      str: 'Joi.string()',
      val: 'hello',
    },
    {
      str: 'Joi.string()',
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
