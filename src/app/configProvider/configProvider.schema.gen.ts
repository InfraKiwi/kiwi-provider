/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
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
   * Unknown Property
   */
  [x: string]: unknown;
}
// [block AssetsDistributionInterface end]
//meta:AssetsDistributionInterface:[{"className":"AssetsDistributionInterface"}]

// [block ConfigProviderConfigInterface begin]
export interface ConfigProviderConfigInterface {
  inventoryPath: string;
  archiveDir: string;

  /**
   * The distribution config for recipes assets.
   */
  assetsDistribution: AssetsDistributionInterface; //typeRef:AssetsDistributionInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * The distribution config for agent binaries.
   */
  agentDistribution: AssetsDistributionInterface; //typeRef:AssetsDistributionInterface:{"relPath":"self","isRegistryExport":false}

  logsStorage: LogsStorageInterface; //typeRef:LogsStorageInterface:{"relPath":"self","isRegistryExport":false}

  workDir?: string;
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
   * Unknown Property
   */
  [x: string]: unknown;
}
// [block LogsStorageInterface end]
//meta:LogsStorageInterface:[{"className":"LogsStorageInterface"}]
