/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

// [block KiwiInfoInterface begin]
/**
 * An object containing some information about the current kiwi program.
 */
export interface KiwiInfoInterface {
  /**
   * The name of the running kiwi app.
   */
  appName: string;

  /**
   * The path of the config file used at the start of the app, if any was defined.
   */
  configPath?: string;
}
// [block KiwiInfoInterface end]
//meta:KiwiInfoInterface:[{"className":"KiwiInfoInterface"}]
