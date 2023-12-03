import Joi from 'joi';
import { multiDataSourceRegistryEntryFactory } from '../registry';

export const MultiDataSourceGlobSchema = multiDataSourceRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    pattern: Joi.alternatives([Joi.string().required(), Joi.array().items(Joi.string()).required()]).required()
      .description(`
A string or string[] array of glob patterns. 
`),
    workDir: Joi.string().description(`
The working directory to use as root for the glob matching.    
`),
    options: Joi.object({
      dot: Joi.boolean().description(`
Include \`.dot\` files in normal matches and \`globstar\`
matches. Note that an explicit dot in a portion of the pattern
will always match dot files.
`),

      follow: Joi.boolean().description(`
Follow symlinked directories when expanding \`**\`
patterns. This can result in a lot of duplicate references in
the presence of cyclic links, and make performance quite bad.

By default, a \`**\` in a pattern will follow 1 symbolic link if
it is not the first item in the pattern, or none if it is the
first item in the pattern, following the same behavior as Bash.
`),

      ignore: Joi.alternatives([Joi.string(), Joi.array().items(Joi.string())]).description(`
If a string or string[] is provided, then this is treated as a glob
pattern or array of glob patterns to exclude from matches. To ignore all
children within a directory, as well as the entry itself, append \`'/**'\`
to the ignore pattern.

**Note** \`ignore\` patterns are _always_ in \`dot:true\` mode, regardless of
any other settings.
`),

      magicalBraces: Joi.boolean().description(`
Treat brace expansion like \`{a,b}\` as a "magic" pattern.
`),

      maxDepth: Joi.number().description(`
Limit the directory traversal to a given depth below the cwd.
Note that this does NOT prevent traversal to sibling folders,
root patterns, and so on. It only limits the maximum folder depth
that the walk will descend, relative to the cwd.
`),
    }),
  }),
);
