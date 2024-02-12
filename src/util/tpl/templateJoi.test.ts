/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, expect, test } from '@jest/globals';
import { joiSchemaBuildFromString, TemplateJoi } from './templateJoi';
import { joiSchemaDump } from '../joi';
import Joi from 'joi';

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

describe('buildJoiSchemaFromString', () => {
  const templates: {
    str: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    test: any;
    expect: boolean;
  }[] = [
    {
      str: 'Joi.string()',
      test: 'hello',
      expect: true,
    },
    {
      str: 'Joi.string()',
      test: 2,
      expect: false,
    },
    {
      str: joiSchemaDump(Joi.string()),
      test: 'hello',
      expect: true,
    },
    {
      str: joiSchemaDump(Joi.string()),
      test: 2,
      expect: false,
    },
  ];

  test.each(templates)('%s', async (el) => {
    const schema = joiSchemaBuildFromString(el.str);
    const isTrue = schema.validate(el.test);
    expect(isTrue.error == null).toEqual(el.expect);
  });
});
