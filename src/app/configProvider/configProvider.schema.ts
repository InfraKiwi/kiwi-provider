/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { CompileArchiveForHostResultSchema } from '../../commands/compileArchiveForHost.schema';
import { getJoiEnumValues, joiMetaClassName, joiMetaUnknownType, joiObjectSchemaKeys } from '../../util/joi';
import { ServerHookWithArraySchema } from '../common/server.schema';
import { NodeJSExecutableArch, NodeJSExecutablePlatform } from '../../util/downloadNodeDist';

export const ConfigProviderListenerDefaultPort = 13900;

export const ConfigProviderHeaderHostname = 'X-10INFRA-HOSTNAME';
export const ConfigProviderRoutesHostPath = '/host';
export const ConfigProviderRoutesAdminPath = '/admin';
export const ConfigProviderRoutesBootstrapPath = '/bootstrap';

export const AssetsDistributionSchema = Joi.object()
  .unknown(true)
  .meta(joiMetaClassName('AssetsDistributionInterface'))
  .meta(
    joiMetaUnknownType(
      Joi.any().description(`
The assets distribution config.
You can check the available assets distribution methods here: ##link#See all available assets distribution methods#/assetsDistribution
`)
    )
  );
export const LogsStorageSchema = Joi.object()
  .unknown(true)
  .meta(joiMetaClassName('LogsStorageInterface'))
  .meta(
    joiMetaUnknownType(
      Joi.any().description(`
The logs storage config.
You can check the available logs storage methods here: ##link#See all available logs storage methods#/logsStorage
`)
    )
  );

export const ConfigProviderHooksSchema = Joi.object({
  report: ServerHookWithArraySchema.description(
    'This hook will be triggered whenever the worker sends a recipe execution report'
  ),
}).meta(joiMetaClassName('ConfigProviderHooksInterface'));

export const ConfigProviderHooksKeysSchema = Joi.string()
  .valid(...joiObjectSchemaKeys(ConfigProviderHooksSchema))
  .meta(joiMetaClassName('ConfigProviderHooksKeysInterface'));

export const ConfigProviderConfigSchema = Joi.object({
  inventoryPath: Joi.string().required().description(`
  The path of the inventory file.
  `),

  archiveDir: Joi.string().required().description(`
  The path of the archive directory.
  `),

  assetsDistribution: AssetsDistributionSchema.required().description(`
The assets distribution config for recipes' assets.
`),
  agentDistribution: AssetsDistributionSchema.required().description(`
The assets distribution config for agent binaries.
`),

  logsStorage: LogsStorageSchema.required(),

  workDir: Joi.string().description(`
  If defined, will be used for all internal operations requiring a static files root, like logs storage.
  `),

  hooks: ConfigProviderHooksSchema.description(`
  All hooks definitions.
  `),
}).meta(joiMetaClassName('ConfigProviderConfigInterface'));

export const ConfigProviderRouteGetConfigForHostnameResultSchema = Joi.object({
  compileResult: CompileArchiveForHostResultSchema.required(),
}).meta(joiMetaClassName('ConfigProviderRouteGetConfigForHostnameResultInterface'));

// --- ROUTES

export const AgentDistributionGetDownloadRequestSchema = Joi.object({
  nodePlatform: getJoiEnumValues(NodeJSExecutablePlatform).required(),
  nodeArch: getJoiEnumValues(NodeJSExecutableArch).required(),
}).meta(joiMetaClassName('AgentDistributionGetDownloadRequestInterface'));

export const AgentDistributionInstallShRequestSchema = Joi.object({
  externalUrl: Joi.string().uri(),
}).meta(joiMetaClassName('AgentDistributionInstallShRequestInterface'));
