import Joi from 'joi';
import { joiMetaClassName } from '../util/joi';

export const AbstractRunnerGetDownloadUrlRequestSchema = Joi.object({
  assetFile: Joi.string().required(),
}).meta(joiMetaClassName('AbstractRunnerGetDownloadUrlRequestInterface'));

export const AbstractRunnerGetDownloadUrlResponseSchema = Joi.object({
  downloadUrl: Joi.string().required(),
}).meta(joiMetaClassName('AbstractRunnerGetDownloadUrlResponseInterface'));
