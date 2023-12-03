import type { ServerHookWithArrayInterface } from '../common/server.schema.gen';
import type { CompileArchiveForHostResultInterface } from '../../commands/compileArchiveForHost.schema.gen';
// Generated with: yarn gen -> cmd/schemaGen.ts

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

// [block AgentDistributionInstallShRequestInterface begin]
export interface AgentDistributionInstallShRequestInterface {
  externalUrl?: string;
}
// [block AgentDistributionInstallShRequestInterface end]

// [block AssetsDistributionInterface begin]
export interface AssetsDistributionInterface {
  /**
   * Unknown Property
   */
  [x: string]: unknown;
}
// [block AssetsDistributionInterface end]

// [block ConfigProviderConfigInterface begin]
export interface ConfigProviderConfigInterface {
  inventoryPath: string;
  archiveDir: string;

  /**
   * The distribution config for recipes assets.
   */
  assetsDistribution: AssetsDistributionInterface; //typeRef:AssetsDistributionInterface:configProvider.schema.gen.ts:false

  /**
   * The distribution config for agent binaries.
   */
  agentDistribution: AssetsDistributionInterface; //typeRef:AssetsDistributionInterface:configProvider.schema.gen.ts:false

  logsStorage: LogsStorageInterface; //typeRef:LogsStorageInterface:configProvider.schema.gen.ts:false

  workDir?: string;
  hooks?: ConfigProviderHooksInterface; //typeRef:ConfigProviderHooksInterface:configProvider.schema.gen.ts:false

}
// [block ConfigProviderConfigInterface end]

// [block ConfigProviderHooksInterface begin]
export interface ConfigProviderHooksInterface {
  /**
   * This hook will be triggered whenever the worker sends a recipe execution report
   */
  report?: ServerHookWithArrayInterface; //typeRef:ServerHookWithArrayInterface:../common/server.schema.gen.ts:false

}
// [block ConfigProviderHooksInterface end]

// [block ConfigProviderHooksKeysInterface begin]
export type ConfigProviderHooksKeysInterface = 'report';
// [block ConfigProviderHooksKeysInterface end]

// [block ConfigProviderRouteGetConfigForHostnameResultInterface begin]
export interface ConfigProviderRouteGetConfigForHostnameResultInterface {
  compileResult: CompileArchiveForHostResultInterface; //typeRef:CompileArchiveForHostResultInterface:../../commands/compileArchiveForHost.schema.gen.ts:false

}
// [block ConfigProviderRouteGetConfigForHostnameResultInterface end]

// [block LogsStorageInterface begin]
export interface LogsStorageInterface {
  /**
   * Unknown Property
   */
  [x: string]: unknown;
}
// [block LogsStorageInterface end]
