/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

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
//meta:AgentConfigInterface:[{"className":"AgentConfigInterface"}]
