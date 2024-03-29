/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

// [block AgentBootstrapConfigInterface begin]
export interface AgentBootstrapConfigInterface {
  url: string;
  installDir: string;

  /**
   * If true, forcefully overwrite any existing kiwiAgent config.
   */
  force?: boolean;
}
// [block AgentBootstrapConfigInterface end]
//meta:AgentBootstrapConfigInterface:[{"className":"AgentBootstrapConfigInterface"}]
