/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

// [block TenInfraInfoInterface begin]
/**
 * An object containing some information about the current 10infra program.
 */
export interface TenInfraInfoInterface {
  /**
   * The name of the running 10infra app.
   */
  appName: string;

  /**
   * The path of the config file used at the start of the app, if any was defined.
   */
  configPath?: string;
}
// [block TenInfraInfoInterface end]
//meta:TenInfraInfoInterface:[{"className":"TenInfraInfoInterface"}]
