/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, test } from '@jest/globals';
import Joi from 'joi';
import { joiFindMetaValuePaths, joiKeepOnlyKeysNotInJoiObjectDiff, joiSchemaAcceptsString } from './joi';

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

  describe('joiFindMetaValuePaths', () => {
    const metaFindMe = { findMe: true };
    const tests: {
      schema: Joi.Schema;
      expect: string[][];
    }[] = [
      {
        schema: Joi.alternatives([
          Joi.number(),
          Joi.object({
            str: Joi.string().meta(metaFindMe),
          }),
        ]),
        expect: [['str']],
      },
      {
        schema: Joi.object({
          hello: Joi.string().meta(metaFindMe),
        }),
        expect: [['hello']],
      },
      {
        schema: Joi.object({
          hello: Joi.object({
            lower: Joi.string().meta(metaFindMe),
          }),
        }),
        expect: [['hello', 'lower']],
      },
      {
        schema: Joi.object({
          hello: Joi.array().items(Joi.number().meta(metaFindMe)),
        }),
        expect: [['hello', '0']],
      },
      {
        schema: Joi.alternatives([Joi.number(), Joi.string()]).meta(metaFindMe),
        expect: [[]],
      },
      {
        schema: Joi.alternatives([Joi.number(), Joi.string().meta(metaFindMe)]),
        expect: [[]],
      },
    ];

    test.each(tests)('%#', (t) => {
      const paths = joiFindMetaValuePaths(t.schema.describe(), 'findMe', true, true);
      expect(paths).toEqual(t.expect);
    });
  });
});
