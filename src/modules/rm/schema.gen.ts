/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ModuleRmGlobInterface begin]
/**
 * The glob config to use to remove files and directories.
 */
export interface ModuleRmGlobInterface {
  /**
   * If true, remove directories and their contents recursively.
   *
   * As with the `rm -r` command, `recursive` is needed to delete a directory.
   */
  recursive?: boolean;

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
   * The working directory to use as root for the glob matching.
   */
  workDir?: string;

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
}
// [block ModuleRmGlobInterface end]
//meta:ModuleRmGlobInterface:[{"className":"ModuleRmGlobInterface","entryNames":["rmGlob"]}]

// [block ModuleRmInterface begin]
export interface ModuleRmInterface {
  path:

    /**
     * The path of a single file or directory to remove
     */
    | string

    /**
     * An array of paths of files or directories to remove
     */
    | string[];

  /**
   * If true, remove directories and their contents recursively.
   *
   * As with the `rm -r` command, `recursive` is needed to delete a directory.
   */
  recursive?: boolean;

  /**
   * When `true`, exceptions will be ignored if `path` does not exist.
   */
  force?: boolean;
}
// [block ModuleRmInterface end]
//meta:ModuleRmInterface:[{"className":"ModuleRmInterface","entryNames":["rm"]}]

export type ModuleRmInterfaceConfigKey = 'rm';
export const ModuleRmInterfaceConfigKeyFirst = 'rm';

export type ModuleRmGlobInterfaceConfigKey = 'rmGlob';
export const ModuleRmGlobInterfaceConfigKeyFirst = 'rmGlob';
