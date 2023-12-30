/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

import type { ServerHookWithArrayInterface } from '../common/server.schema.gen';
import type { CompileArchiveForHostResultInterface } from '../../commands/compileArchiveForHost.schema.gen';

// [block AgentDistributionGetDownloadRequestInterface begin]
export interface AgentDistributionGetDownloadRequestInterface {
  nodePlatform:
    | 'win'
    | 'linux'
    | 'darwin';
  nodeArch:
    | 'x64'
    | 'arm64'
    | 'armv7l';
}
// [block AgentDistributionGetDownloadRequestInterface end]
//meta:AgentDistributionGetDownloadRequestInterface:[{"className":"AgentDistributionGetDownloadRequestInterface"}]

// [block AgentDistributionInstallShRequestInterface begin]
export interface AgentDistributionInstallShRequestInterface {
  externalUrl?: string;
}
// [block AgentDistributionInstallShRequestInterface end]
//meta:AgentDistributionInstallShRequestInterface:[{"className":"AgentDistributionInstallShRequestInterface"}]

// [block AssetsDistributionInterface begin]
export interface AssetsDistributionInterface {
  /**
   * The assets distribution config.
   * You can check the available assets distribution methods here: ##link#See all available assets distribution methods#/assetsDistribution
   */
  [x: string]: any;
}
// [block AssetsDistributionInterface end]
//meta:AssetsDistributionInterface:[{"className":"AssetsDistributionInterface"},{"unknownType":{"type":"any","flags":{"description":"\nThe assets distribution config.\nYou can check the available assets distribution methods here: ##link#See all available assets distribution methods#/assetsDistribution\n"}}}]

// [block ConfigProviderConfigInterface begin]
export interface ConfigProviderConfigInterface {
  /**
   * The path of the inventory file.
   */
  inventoryPath: string;

  /**
   * The path of the archive directory.
   */
  archiveDir: string;

  /**
   * The assets distribution config for recipes' assets.
   */
  assetsDistribution: AssetsDistributionInterface; //typeRef:AssetsDistributionInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * The assets distribution config for agent binaries.
   */
  agentDistribution: AssetsDistributionInterface; //typeRef:AssetsDistributionInterface:{"relPath":"self","isRegistryExport":false}

  logsStorage: LogsStorageInterface; //typeRef:LogsStorageInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * If defined, will be used for all internal operations requiring a static files root, like logs storage.
   */
  workDir?: string;

  /**
   * All hooks definitions.
   */
  hooks?: ConfigProviderHooksInterface; //typeRef:ConfigProviderHooksInterface:{"relPath":"self","isRegistryExport":false}
}
// [block ConfigProviderConfigInterface end]
//meta:ConfigProviderConfigInterface:[{"className":"ConfigProviderConfigInterface"}]

// [block ConfigProviderHooksInterface begin]
export interface ConfigProviderHooksInterface {
  /**
   * This hook will be triggered whenever the worker sends a recipe execution report
   */
  report?: ServerHookWithArrayInterface; //typeRef:ServerHookWithArrayInterface:{"relPath":"../common/server.schema.gen.ts","isRegistryExport":false}
}
// [block ConfigProviderHooksInterface end]
//meta:ConfigProviderHooksInterface:[{"className":"ConfigProviderHooksInterface"}]

// [block ConfigProviderHooksKeysInterface begin]
export type ConfigProviderHooksKeysInterface = 'report';
// [block ConfigProviderHooksKeysInterface end]
//meta:ConfigProviderHooksKeysInterface:[{"className":"ConfigProviderHooksKeysInterface"}]

// [block ConfigProviderRouteGetConfigForHostnameResultInterface begin]
export interface ConfigProviderRouteGetConfigForHostnameResultInterface {
  compileResult: CompileArchiveForHostResultInterface; //typeRef:CompileArchiveForHostResultInterface:{"relPath":"../../commands/compileArchiveForHost.schema.gen.ts","isRegistryExport":false}
}
// [block ConfigProviderRouteGetConfigForHostnameResultInterface end]
//meta:ConfigProviderRouteGetConfigForHostnameResultInterface:[{"className":"ConfigProviderRouteGetConfigForHostnameResultInterface"}]

// [block LogsStorageInterface begin]
export interface LogsStorageInterface {
  /**
   * The logs storage config.
   * You can check the available logs storage methods here: ##link#See all available logs storage methods#/logsStorage
   */
  [x: string]: any;
}
// [block LogsStorageInterface end]
//meta:LogsStorageInterface:[{"className":"LogsStorageInterface"},{"unknownType":{"type":"any","flags":{"description":"\nThe logs storage config.\nYou can check the available logs storage methods here: ##link#See all available logs storage methods#/logsStorage\n"}}}]
