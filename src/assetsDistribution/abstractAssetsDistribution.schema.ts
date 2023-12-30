/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { joiMetaClassName } from '../util/joi';

export const AbstractAssetsDistributionGetDownloadUrlRoutePath = '/downloadUrl';

export const AbstractAssetsDistributionGetDownloadUrlRequestSchema = Joi.object({
  assetFile: Joi.string().required(),
  plain: Joi.boolean().description(
    'If true, returns the plain URL as string and does not encapsulate the result as a JSON object'
  ),
  redirect: Joi.boolean().description(`
    If true, directly redirects to the download url instead of returning it. 
  `),
}).meta(joiMetaClassName('AbstractAssetsDistributionGetDownloadUrlRequestInterface'));

export const AbstractAssetsDistributionGetDownloadUrlResponseSchema = Joi.object({
  downloadUrl: Joi.string().required(),
}).meta(joiMetaClassName('AbstractAssetsDistributionGetDownloadUrlResponseInterface'));
