import Joi from 'joi';
import { joiMetaClassName } from '../util/joi';

export const AbstractAssetsDistributionGetDownloadUrlRequestSchema = Joi.object({
  assetFile: Joi.string().required(),
}).meta(joiMetaClassName('AbstractAssetsDistributionGetDownloadUrlRequestInterface'));

export const AbstractAssetsDistributionGetDownloadUrlResponseSchema = Joi.object({
  downloadUrl: Joi.string().required(),
}).meta(joiMetaClassName('AbstractAssetsDistributionGetDownloadUrlResponseInterface'));
