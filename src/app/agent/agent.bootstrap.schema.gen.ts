// Generated with: yarn gen -> cmd/schemaGen.ts

// [block AgentBootstrapConfigInterface begin]
export interface AgentBootstrapConfigInterface {
  url: string;
  installDir: string;

  /**
   * If true, forcefully overwrite any existing agent config.
   */
  force?: boolean;
}
// [block AgentBootstrapConfigInterface end]
