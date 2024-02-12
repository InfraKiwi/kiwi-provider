/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

// [block VarsSourceInterface begin]
export interface VarsSourceInterface {
  /**
   * If true, extract templates from loaded variables. Enabled by default.
   */
  template?:
    | true
    | boolean;

  /**
   * If true and if the data source returns an object then strip out all keys and merge all values.
   *
   * E.g. if the data source is a `glob` that returns:
   *
   * {
   *   'test/myFile.yaml': { hello: "World" },
   *   'test/another.yaml': { name: "Mario" }
   * }
   *
   * The loaded variables will be:
   *
   * {
   *   hello: "World",
   *   name: "Mario"
   * }
   */
  flatten?: boolean;

  /**
   * The data source you want to use.
   * You can check the available data sources here: ##link#See all available data sources#/dataSources
   */
  [x: string]: any;
}
// [block VarsSourceInterface end]
//meta:VarsSourceInterface:[{"className":"VarsSourceInterface","unknownType":{"type":"any","flags":{"description":"\n    The data source you want to use.\n    You can check the available data sources here: ##link#See all available data sources#/dataSources\n    "}}}]
