/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';
import { GlobPatternSchemaEntry, MultiDataSourceGlobBaseSchemaObject } from '../../dataSources/glob/schema';
import { omit } from '../../util/object';

export const ModuleCopySchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    from: Joi.alternatives([
      Joi.string().description(`A single file to be copied.`),
      Joi.object({
        workDir: Joi.string().required().description(`
      The working directory to use as base for the glob pattern.
      All resolved paths will be relative to this directory, and the copied files
      structure will be based on this directory path. 
      `),
        ...omit(MultiDataSourceGlobBaseSchemaObject, ['workDir']),
      }).description(`The glob config to use as source.`),
    ])
      .required()
      .description(`The source path(s) for the copy process.`),
    to: Joi.string().required().description(`
    If \`from\` is a string, which means it is a single file, then \`to\`
    can be either the new file path or, if it ends with \`/\` or already exists
    as a folder, then it is the destination folder.
    
    If \`from\` is a glob config, then \`to\` is necessarily the destination folder.
    `),

    template: Joi.alternatives([
      GlobPatternSchemaEntry.description(`
        A glob pattern that represents which files to treat as templates.
        
        If \`from\` is a glob pattern, then this pattern will be relative to 
        the \`workDir\` provided in the \`from\` argument.
        
        If \`from\` is a string, which means it is a single file, then this
        glob pattern needs to include such file if you want it to be processed.
      `),
      Joi.boolean().valid(true).description(`
        Treat every file as a template.
      `),
    ]).description(`
      Whether or not to process some files as templates. If any files are treated 
      as templates, then it will internally read their content, render the templates
      and write the results to the corresponding destination file.
    `),
  })
);
