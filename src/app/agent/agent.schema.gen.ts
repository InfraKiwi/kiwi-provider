// Generated with: yarn gen -> cmd/schemaGen.ts

// [block AgentConfigInterface begin]
export interface AgentConfigInterface {
  /**
   * The id/hostname of the current machine
   */
  hostname?: string;
  configProviderUrl:
    | 'http://127.0.0.1:13900'
    | string;
  databasePath:
    | 'release.db.txt'
    | string;
}
// [block AgentConfigInterface end]
