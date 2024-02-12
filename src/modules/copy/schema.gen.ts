/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

// [block ModuleCopyInterface begin]
export interface ModuleCopyInterface {
  /**
   * The source path(s) for the copy process.
   */
  from:

    /**
     * A single file to be copied.
     */
    | string

    /**
     * The glob config to use as source.
     */
    | ({
      /**
       * The working directory to use as base for the glob pattern.
       * All resolved paths will be relative to this directory, and the copied files
       * structure will be based on this directory path.
       */
      workDir: string;

      /**
       * A string or string[] array of glob patterns.
       */
      pattern:

        /**
         * A glob pattern.
         */
        | string

        /**
         * An array of glob patterns
         */
        | string[];

      /**
       * If a string or string[] is provided, then this is treated as a glob
       * pattern or array of glob patterns to exclude from matches. To ignore all
       * children within a directory, as well as the entry itself, append `'/**'`
       * to the ignore pattern.
       *
       * **Note** `ignore` patterns are _always_ in `dot:true` mode, regardless of
       * any other settings.
       */
      ignore?:
        | string
        | string[];

      /**
       * Include `.dot` files in normal matches and `globstar`
       * matches. Note that an explicit dot in a portion of the pattern
       * will always match dot files.
       */
      dot?:
        | true
        | boolean;

      /**
       * Follow symlinked directories when expanding `**`
       * patterns. This can result in a lot of duplicate references in
       * the presence of cyclic links, and make performance quite bad.
       *
       * By default, a `**` in a pattern will follow 1 symbolic link if
       * it is not the first item in the pattern, or none if it is the
       * first item in the pattern, following the same behavior as Bash.
       */
      follow?: boolean;

      /**
       * Treat brace expansion like `{a,b}` as a "magic" pattern.
       */
      magicalBraces?: boolean;

      /**
       * Limit the directory traversal to a given depth below the cwd.
       * Note that this does NOT prevent traversal to sibling folders,
       * root patterns, and so on. It only limits the maximum folder depth
       * that the walk will descend, relative to the cwd.
       */
      maxDepth?: number;
    });

  /**
   * If `from` is a string, which means it is a single file, then `to`
   * can be either the new file path or, if it ends with `/` or already exists
   * as a folder, then it is the destination folder.
   *
   * If `from` is a glob config, then `to` is necessarily the destination folder.
   */
  to: string;

  /**
   * Whether or not to process some files as templates. If any files are treated
   * as templates, then it will internally read their content, render the templates
   * and write the results to the corresponding destination file.
   */
  template?:

    /**
     * A glob pattern that represents which files to treat as templates.
     *
     * If `from` is a glob pattern, then this pattern will be relative to
     * the `workDir` provided in the `from` argument.
     *
     * If `from` is a string, which means it is a single file, then this
     * glob pattern needs to include such file if you want it to be processed.
     */
    | (

    /**
     * A glob pattern.
     */
      | string

    /**
     * An array of glob patterns
     */
      | string[])

    /**
     * Treat every file as a template.
     */
      | true;
}
// [block ModuleCopyInterface end]
//meta:ModuleCopyInterface:[{"className":"ModuleCopyInterface","entryNames":["copy"]}]

export type ModuleCopyInterfaceConfigKey = 'copy';
export const ModuleCopyInterfaceConfigKeyFirst = 'copy';
