import Joi from 'joi';
import { CompileArchiveForHostResultSchema } from '../../commands/compileArchiveForHost.schema';
import { joiMetaClassName, joiObjectSchemaKeys } from '../../util/joi';
import { ServerHookWithArraySchema } from '../common/server.schema';

export const ServerConfigHeaderHostname = 'X-10INFRA-HOSTNAME';

export const AssetsDistributionSchema = Joi.object().unknown(true).meta({ className: 'AssetsDistributionInterface' });
export const LogsStorageSchema = Joi.object().unknown(true).meta({ className: 'LogsStorageInterface' });

export const ServerConfigHooksSchema = Joi.object({
  report: ServerHookWithArraySchema,
}).meta(joiMetaClassName('ServerConfigHooksInterface'));

export const ServerConfigHooksKeysSchema = Joi.string()
  .allow(...joiObjectSchemaKeys(ServerConfigHooksSchema))
  .meta(joiMetaClassName('ServerConfigHooksKeysInterface'));

export const ServerConfigConfigSchema = Joi.object({
  inventoryPath: Joi.string().required(),
  archiveDir: Joi.string().required(),
  assetsDistribution: AssetsDistributionSchema.required(),
  logsStorage: LogsStorageSchema.required(),

  // If defined, will be used for all internal operations requiring a static files root, like logs storage
  workDir: Joi.string(),

  // All possible hooks definitions
  hooks: ServerConfigHooksSchema,
}).meta(joiMetaClassName('ServerConfigConfigInterface'));

export const ServerConfigRouteGetConfigForHostnameResultSchema = Joi.object({
  compileResult: CompileArchiveForHostResultSchema.required(),
}).meta(joiMetaClassName('ServerConfigRouteGetConfigForHostnameResultInterface'));
