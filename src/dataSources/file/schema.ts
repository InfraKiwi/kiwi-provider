/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { dataSourceRegistryEntryFactory } from '../registry';

import { loadYAML } from '../../util/yaml';
import { generateAndLoadESBuildBundleFromFile } from '../../util/esbuild/esbuild';
import type { ContextLogger } from '../../util/context';
import { fsPromiseReadFile } from '../../util/fs';

export type DataSourceFileLoaderFunction = (context: ContextLogger, filePath: string) => Promise<unknown>;

const loadYAMLAsLoader: DataSourceFileLoaderFunction = async (c, filePath) => {
  const content = await fsPromiseReadFile(filePath, 'utf-8');
  return loadYAML(content);
};
export const fileLoadersMap: Record<string, DataSourceFileLoaderFunction> = {
  '.yaml': loadYAMLAsLoader,
  '.yml': loadYAMLAsLoader,
  '.json': loadYAMLAsLoader,
  '.js': generateAndLoadESBuildBundleFromFile,
  '.ts': generateAndLoadESBuildBundleFromFile,
};
export const getAvailableFileLoadersExtensions = () => Object.keys(fileLoadersMap);

const supportedFileTypesText =
  'Supported file types: ' +
  getAvailableFileLoadersExtensions()
    .map((e) => `\`${e}\``)
    .join(', ');

/*
 * This base schema exists for any module that depends on the file source,
 * which needs to enforce a non-raw processing of the file
 */
export const DataSourceFileBaseSchemaObject = {
  path: Joi.string().required().description('The path of the file to load'),
  workDir: Joi.string().description('The working directory to use'),
};

const DataSourceFileFullSchema = Joi.object({
  ...DataSourceFileBaseSchemaObject,
  raw: Joi.boolean().description(`
If true, do not parse the file via a loader.
The loaded content will be wrapped by a \`content\` variable. 
`),
});

export const DataSourceFileSchema = dataSourceRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  DataSourceFileFullSchema
).description(`
Loads a local file's contents and parses it using a loader, chosen based on the file's extension. 

${supportedFileTypesText}
`);

export const DataSourceFileRawSchema = dataSourceRegistryEntryFactory.createJoiEntrySchema(
  'fileRaw',
  Joi.object(DataSourceFileBaseSchemaObject)
).description(`
Loads a local file's contents.
`);
