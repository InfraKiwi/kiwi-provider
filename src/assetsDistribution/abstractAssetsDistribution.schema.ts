import Joi from 'joi';
import { joiMetaClassName } from '../util/joi';

export const AbstractAssetsDistributionGetDownloadUrlRoutePath = '/downloadUrl';

export const AbstractAssetsDistributionGetDownloadUrlRequestSchema = Joi.object({
  assetFile: Joi.string().required(),
  plain: Joi.boolean().description(
    `If true, returns the plain URL as string and does not encapsulate the result as a JSON object`,
  ),
}).meta(joiMetaClassName('AbstractAssetsDistributionGetDownloadUrlRequestInterface'));

export const AbstractAssetsDistributionGetDownloadUrlResponseSchema = Joi.object({
  downloadUrl: Joi.string().required(),
}).meta(joiMetaClassName('AbstractAssetsDistributionGetDownloadUrlResponseInterface'));
