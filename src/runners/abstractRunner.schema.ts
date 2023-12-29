/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { joiMetaClassName } from '../util/joi';

export const AbstractRunnerGetDownloadUrlRequestSchema = Joi.object({
  assetFile: Joi.string().required(),
}).meta(joiMetaClassName('AbstractRunnerGetDownloadUrlRequestInterface'));

export const AbstractRunnerGetDownloadUrlResponseSchema = Joi.object({
  downloadUrl: Joi.string().required(),
}).meta(joiMetaClassName('AbstractRunnerGetDownloadUrlResponseInterface'));
