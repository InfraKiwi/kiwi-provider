import Joi from 'joi';
import { multiDataSourceRegistryEntryFactory } from '../registry';

export const MultiDataSourceGlobSchema = multiDataSourceRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    pattern: Joi.alternatives([Joi.string().required(), Joi.array().items(Joi.string()).required()]).required(),
    workDir: Joi.string(),
    options: Joi.object({
      /**
       * Include `.dot` files in normal matches and `globstar`
       * matches. Note that an explicit dot in a portion of the pattern
       * will always match dot files.
       */

      dot: Joi.boolean(),
      /**
       * Follow symlinked directories when expanding `**`
       * patterns. This can result in a lot of duplicate references in
       * the presence of cyclic links, and make performance quite bad.
       *
       * By default, a `**` in a pattern will follow 1 symbolic link if
       * it is not the first item in the pattern, or none if it is the
       * first item in the pattern, following the same behavior as Bash.
       */

      follow: Joi.boolean(),

      /**
       * string or string[], or an object with `ignore` and `ignoreChildren`
       * methods.
       *
       * If a string or string[] is provided, then this is treated as a glob
       * pattern or array of glob patterns to exclude from matches. To ignore all
       * children within a directory, as well as the entry itself, append `'/**'`
       * to the ignore pattern.
       *
       * **Note** `ignore` patterns are _always_ in `dot:true` mode, regardless of
       * any other settings.
       *
       * If an object is provided that has `ignored(path)` and/or
       * `childrenIgnored(path)` methods, then these methods will be called to
       * determine whether any Path is a match or if its children should be
       * traversed, respectively.
       */
      ignore: Joi.alternatives([Joi.string(), Joi.array().items(Joi.string())]),

      /**
       * Treat brace expansion like `{a,b}` as a "magic" pattern.
       */
      magicalBraces: Joi.boolean(),

      /**
       * Limit the directory traversal to a given depth below the cwd.
       * Note that this does NOT prevent traversal to sibling folders,
       * root patterns, and so on. It only limits the maximum folder depth
       * that the walk will descend, relative to the cwd.
       */
      maxDepth: Joi.number(),
    }),
  }),
);
