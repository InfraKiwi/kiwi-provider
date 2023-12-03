import Joi from 'joi';
import { dataSourceRegistryEntryFactory } from '../registry';

import { loadYAML } from '../../util/yaml';

export type DataSourceFileLoaderFunction = (filePath: string) => Promise<unknown>;
export const fileLoadersMap: Record<string, DataSourceFileLoaderFunction> = {
  '.yaml': loadYAML,
  '.yml': loadYAML,
  '.json': loadYAML,
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
  path: Joi.string().required().description(`The path of the file to load`),
  workDir: Joi.string().description(`The working directory to use`),
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
  DataSourceFileFullSchema,
).description(`
Loads a local file's contents and parses it using a loader, chosen based on the file's extension. 

${supportedFileTypesText}
`);

export const DataSourceFileRawSchema = dataSourceRegistryEntryFactory.createJoiEntrySchema(
  'fileRaw',
  Joi.object(DataSourceFileBaseSchemaObject),
).description(`
Loads a local file's contents.
`);
