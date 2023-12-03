// Generated with: yarn gen -> cmd/schemaGen.ts

// [block VarsSourceInterface begin]
export interface VarsSourceInterface {
  /**
   * If true, extract templates from loaded variables
   */
  template?: boolean;

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
   */
  [x: string]: any;
}
// [block VarsSourceInterface end]
