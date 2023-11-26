import Joi from 'joi';
import { getJoiEnumValues, joiMetaClassName } from '../../util/joi';

export enum HostReportStatus {
  pending = 'pending',
  running = 'running',
  success = 'success',
  failure = 'failure',
}

export enum HostReportType {
  init = 'init',
  recipe = 'recipe',
}

export const HostReportSchemaIdObject = {
  hostname: Joi.string().required(),
  release: Joi.string().required(),
  status: getJoiEnumValues(HostReportStatus).required(),
  type: getJoiEnumValues(HostReportType).required(),
  key: Joi.string().required(),
};

export const HostReportRequestSchema = Joi.object({
  timestamp: Joi.number().required(),
})
  .append(HostReportSchemaIdObject)
  .meta(joiMetaClassName('HostReportRequestInterface'));
