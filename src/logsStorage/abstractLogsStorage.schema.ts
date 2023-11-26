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

// export const AbstractLogsStorageGetDownloadUrlRequestSchema = Joi.object({
//   storageKey: Joi.string().required(),
// }).meta(joiMetaClassName('AbstractLogsStorageGetDownloadUrlRequestInterface'));

export const AbstractLogsStorageGetDownloadUrlResponseSchema = Joi.object({
  downloadUrl: Joi.string().required(),
}).meta(joiMetaClassName('AbstractLogsStorageGetDownloadUrlResponseInterface'));
