/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi, { type SchemaMap } from 'joi';
import { joiMetaClassName } from './joi';

export const parseArgsS3Options: ParseArgsOptionsConfig = {
  s3Bucket: {
    type: 'string',
  },
  s3Prefix: {
    type: 'string',
  },
  s3Endpoint: {
    type: 'string',
  },
};

export const joiParseArgsS3Options = {
  s3Bucket: Joi.string(),
  s3Prefix: Joi.string(),
  s3Endpoint: Joi.string(),
};

export const joiParseArgsS3RequiredOptions: SchemaMap = {
  ...joiParseArgsS3Options,
  s3Bucket: joiParseArgsS3Options.s3Bucket.required(),
};

export const joiParseArgsS3OptionsSchema = Joi.object(joiParseArgsS3Options).meta(
  joiMetaClassName('joiParseArgsS3OptionsInterface')
);
export const joiParseArgsS3RequiredOptionsSchema = Joi.object(joiParseArgsS3RequiredOptions).meta(
  joiMetaClassName('joiParseArgsS3RequiredOptionsInterface')
);
