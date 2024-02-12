/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

import type { ServerHookWithArrayInterface } from '../common/server.schema.gen';
import type { CompileArchiveForHostResultInterface } from '../../commands/compileArchiveForHost.schema.gen';
import type { DataSourceHTTPRawInterface } from '../../dataSources/http/schema.gen';

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
  format?:
    | 'raw'
    | 'gz';
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

// [block KiwiProviderConfigInterface begin]
export interface KiwiProviderConfigInterface {
  /**
   * The path of the inventory file.
   */
  inventoryPath: string;

  /**
   * The path of the archive config file.
   */
  archiveFile: string;

  /**
   * The assets distribution config for recipes' assets.
   */
  assetsDistribution: AssetsDistributionInterface; //typeRef:AssetsDistributionInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * The assets distribution config for kiwi-agent binaries.
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
  hooks?: KiwiProviderHooksInterface; //typeRef:KiwiProviderHooksInterface:{"relPath":"self","isRegistryExport":false}
}
// [block KiwiProviderConfigInterface end]
//meta:KiwiProviderConfigInterface:[{"className":"KiwiProviderConfigInterface"}]

// [block KiwiProviderHooksInterface begin]
export interface KiwiProviderHooksInterface {
  /**
   * This hook will be triggered whenever the worker sends a recipe execution report
   */
  report?: ServerHookWithArrayInterface; //typeRef:ServerHookWithArrayInterface:{"relPath":"../common/server.schema.gen.ts","isRegistryExport":false}
}
// [block KiwiProviderHooksInterface end]
//meta:KiwiProviderHooksInterface:[{"className":"KiwiProviderHooksInterface"}]

// [block KiwiProviderHooksKeysInterface begin]
export type KiwiProviderHooksKeysInterface = 'report';
// [block KiwiProviderHooksKeysInterface end]
//meta:KiwiProviderHooksKeysInterface:[{"className":"KiwiProviderHooksKeysInterface"}]

// [block KiwiProviderRouteGetConfigForHostnameResultInterface begin]
export interface KiwiProviderRouteGetConfigForHostnameResultInterface {
  compileResult: CompileArchiveForHostResultInterface; //typeRef:CompileArchiveForHostResultInterface:{"relPath":"../../commands/compileArchiveForHost.schema.gen.ts","isRegistryExport":false}
}
// [block KiwiProviderRouteGetConfigForHostnameResultInterface end]
//meta:KiwiProviderRouteGetConfigForHostnameResultInterface:[{"className":"KiwiProviderRouteGetConfigForHostnameResultInterface"}]

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

// [block ProviderAppConfigInterface begin]
export interface ProviderAppConfigInterface {
  listener?: {
    /**
     * The address to listen on
     */
    addr?:
      | '127.0.0.1'
      | string;

    /**
     * The port to listen on
     */
    port?:
      | 13900
      | number;
    externalUrl?:
      | 'http://127.0.0.1:13900'
      | string;

    /**
     * The method to use to notify the server's health.
     *
     * Note: the server always exposes the `/health` endpoint for
     * pull-based health checks. The `health` methods are needed only
     * for push-based health checks, which wait for a notification.
     */
    health?:

      /**
       * Notify the system via systemd-notify.
       *
       * You can use this setting when the server is configured
       * as a systemd service with type `Type=notify`.
       */
      | {
        'systemd-notify': Record<string, never>;
      }

      /**
       * Sends an HTTP request as soon as the server is healthy.
       */
      | {
        http: DataSourceHTTPRawInterface; //typeRef:DataSourceHTTPRawInterface:{"relPath":"../../dataSources/http/schema.gen.ts","isRegistryExport":false}
      };
  };
  app?: KiwiProviderConfigInterface; //typeRef:KiwiProviderConfigInterface:{"relPath":"self","isRegistryExport":false}
}
// [block ProviderAppConfigInterface end]
//meta:ProviderAppConfigInterface:[{"className":"ProviderAppConfigInterface"}]
