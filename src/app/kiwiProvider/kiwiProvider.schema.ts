/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { CompileArchiveForHostResultSchema } from '../../commands/compileArchiveForHost.schema';
import { getJoiEnumKeys, joiMetaClassName, joiMetaUnknownType, joiObjectSchemaKeys } from '../../util/joi';
import { ServerHookWithArraySchema } from '../common/server.schema';
import { NodeJSExecutableArch, NodeJSExecutablePlatform } from '../../util/downloadNodeDist';
import { CommandCreateNodeJSBundleFormat } from '../../commands/createNodeJSBundle.schema';
import { getAppConfigSchemaObject } from '../common/server';
import { localhost127 } from '../../util/constants';

export const KiwiProviderListenerDefaultPort = 13900;

export const KiwiProviderHeaderHostname = 'X-KIWI-HOSTNAME';
export const KiwiProviderRoutesHostPath = '/host';
export const KiwiProviderRoutesAdminPath = '/admin';
export const KiwiProviderRoutesBootstrapPath = '/bootstrap';

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

export const KiwiProviderHooksSchema = Joi.object({
  report: ServerHookWithArraySchema.description(
    'This hook will be triggered whenever the worker sends a recipe execution report'
  ),
}).meta(joiMetaClassName('KiwiProviderHooksInterface'));

export const KiwiProviderHooksKeysSchema = Joi.string()
  .valid(...joiObjectSchemaKeys(KiwiProviderHooksSchema))
  .meta(joiMetaClassName('KiwiProviderHooksKeysInterface'));

export const KiwiProviderConfigSchema = Joi.object({
  inventoryPath: Joi.string().required().description(`
  The path of the inventory file.
  `),

  archiveFile: Joi.string().required().description(`
  The path of the archive config file.
  `),

  assetsDistribution: AssetsDistributionSchema.required().description(`
The assets distribution config for recipes' assets.
`),
  agentDistribution: AssetsDistributionSchema.required().description(`
The assets distribution config for kiwi-agent binaries.
`),

  logsStorage: LogsStorageSchema.required(),

  workDir: Joi.string().description(`
  If defined, will be used for all internal operations requiring a static files root, like logs storage.
  `),

  hooks: KiwiProviderHooksSchema.description(`
  All hooks definitions.
  `),
}).meta(joiMetaClassName('KiwiProviderConfigInterface'));

export const KiwiProviderRouteGetConfigForHostnameResultSchema = Joi.object({
  compileResult: CompileArchiveForHostResultSchema.required(),
}).meta(joiMetaClassName('KiwiProviderRouteGetConfigForHostnameResultInterface'));

// --- ROUTES

export const AgentDistributionGetDownloadRequestSchema = Joi.object({
  nodePlatform: getJoiEnumKeys(NodeJSExecutablePlatform).required(),
  nodeArch: getJoiEnumKeys(NodeJSExecutableArch).required(),
  format: getJoiEnumKeys(CommandCreateNodeJSBundleFormat),
}).meta(joiMetaClassName('AgentDistributionGetDownloadRequestInterface'));

export const AgentDistributionInstallShRequestSchema = Joi.object({
  externalUrl: Joi.string().uri(),
}).meta(joiMetaClassName('AgentDistributionInstallShRequestInterface'));

export const ProviderAppConfigSchema = getAppConfigSchemaObject(KiwiProviderConfigSchema, {
  addr: localhost127,
  port: KiwiProviderListenerDefaultPort,
}).meta(joiMetaClassName('ProviderAppConfigInterface'));
