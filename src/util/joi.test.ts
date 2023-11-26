import { describe, test } from '@jest/globals';
import Joi from 'joi';
import { keepOnlyKeysNotInJoiObjectDiff } from './joi';

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

    const diff = keepOnlyKeysNotInJoiObjectDiff(
      {
        a: 1,
        b: 2,
        c: 3,
        d: 4,
      },
      schemaBase,
      schemaExt,
    );

    expect(diff).toEqual({ a: 1, b: 2 });
  });
});
