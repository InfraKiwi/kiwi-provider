/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';
import { MultiDataSourceGlobBaseSchemaObject } from '../../dataSources/glob/schema';

export const ModuleRmSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,

  Joi.object({
    path: Joi.alternatives([
      Joi.string().description(`The path of a single file or directory to remove`),
      Joi.array().items(Joi.string()).description(`An array of paths of files or directories to remove`),
    ]).required(),
    recursive: Joi.boolean().description(`
      If true, remove directories and their contents recursively.
      
      As with the \`rm -r\` command, \`recursive\` is needed to delete a directory.
    `),
    force: Joi.boolean().description(`When \`true\`, exceptions will be ignored if \`path\` does not exist.`),
  })
);

export const ModuleRmGlobSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname + 'Glob',
  Joi.object({
    recursive: Joi.boolean().description(`
      If true, remove directories and their contents recursively.
      
      As with the \`rm -r\` command, \`recursive\` is needed to delete a directory.
    `),
  }).append(MultiDataSourceGlobBaseSchemaObject).description(`
      The glob config to use to remove files and directories.
    `)
);
