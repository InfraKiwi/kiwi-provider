/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { joiMetaClassName } from '../util/joi';
import { HostReportSchemaIdObject } from '../app/common/models.schema';

export const LogsStorageRoutesMountPrefix = '/logsStorage';

export const AbstractLogsStorageGetUploadUrlRequestSchema = Joi.object({})
  .append(HostReportSchemaIdObject)
  .meta(joiMetaClassName('AbstractLogsStorageGetUploadUrlRequestInterface'));

export const AbstractLogsStorageGetUploadUrlResponseSchema = Joi.object({
  storageKey: Joi.string().required(),
  uploadUrl: Joi.string().required(),
}).meta(joiMetaClassName('AbstractLogsStorageGetUploadUrlResponseInterface'));

/*
 * export const AbstractLogsStorageGetDownloadUrlRequestSchema = Joi.object({
 *   storageKey: Joi.string().required(),
 * }).meta(joiMetaClassName('AbstractLogsStorageGetDownloadUrlRequestInterface'));
 */

export const AbstractLogsStorageGetDownloadUrlResponseSchema = Joi.object({
  downloadUrl: Joi.string().required(),
}).meta(joiMetaClassName('AbstractLogsStorageGetDownloadUrlResponseInterface'));
