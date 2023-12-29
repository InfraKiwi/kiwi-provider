/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, test } from '@jest/globals';
import Joi from 'joi';
import { joiKeepOnlyKeysNotInJoiObjectDiff, joiSchemaAcceptsString } from './joi';

describe('joi utils', () => {
  test('keys diff', () => {
    const schemaBase = Joi.object({
      a: Joi.string(),
      b: Joi.string(),
    });

    const schemaExt = schemaBase.append({
      c: Joi.string(),
      d: Joi.string(),
    });

    const diff = joiKeepOnlyKeysNotInJoiObjectDiff(
      {
        a: 1,
        b: 2,
        c: 3,
        d: 4,
      },
      schemaBase,
      schemaExt
    );

    expect(diff).toEqual({
      a: 1,
      b: 2,
    });
  });

  describe('joiSchemaAcceptsString', () => {
    const tests: {
      schema: Joi.Schema;
      expect: boolean;
    }[] = [
      {
        schema: Joi.string(),
        expect: true,
      },
      {
        schema: Joi.any(),
        expect: true,
      },
      {
        schema: Joi.alternatives([Joi.object(), Joi.string()]),
        expect: true,
      },
      {
        schema: Joi.alternatives([Joi.object()]),
        expect: false,
      },
      {
        schema: Joi.object(),
        expect: false,
      },
      {
        schema: Joi.object({}),
        expect: false,
      },
      {
        schema: Joi.alternatives(),
        expect: false,
      },
    ];

    test.each(tests)('%#', (t) => {
      expect(joiSchemaAcceptsString(t.schema)).toEqual(t.expect);
    });
  });
});
