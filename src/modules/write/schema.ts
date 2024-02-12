/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';
import { DEFAULT_SCHEMA, dump } from 'js-yaml';
import { omit } from '../../util/object';

type ModuleWriteSerializerFunction = (data: unknown) => Promise<string>;
const serializerYAML: ModuleWriteSerializerFunction = async (data: unknown): Promise<string> => {
  return dump(data, { schema: DEFAULT_SCHEMA });
};
const serializerJSON: ModuleWriteSerializerFunction = async (data: unknown): Promise<string> => {
  return JSON.stringify(data);
};
export const fileSerializersMap: Record<string, ModuleWriteSerializerFunction> = {
  '.yaml': serializerYAML,
  '.yml': serializerYAML,
  '.json': serializerJSON,
};

const ModuleWriteSchemaObject = {
  path: Joi.string().required().description(`The path of the file.`),
  workDir: Joi.string().description(`The working directory to use as reference.`),
  raw: Joi.boolean().default(false).optional().description(`
      When \`raw\` is undefined or \`false\`, then \`content\` will be serialized 
      using the file extension as a hint.
      Supported extensions are: ${Object.keys(fileSerializersMap)
        .map((e) => `\`${e}\``)
        .join(', ')}
      
      If true, do not auto-convert the contents to fit the file type.
      In this case, \`content\` must forcefully be a string already.
      `),
  content: Joi.when('raw', {
    is: Joi.boolean().valid(true),
    then: Joi.string(),
    otherwise: Joi.any(),
  }).required().description(`
      Any kind of content.
      
      If \`raw\` is \`false\`, then \`content\` needs to be a \`string\`.
    `),
};

export const ModuleWriteSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object(ModuleWriteSchemaObject)
);

export const ModuleWriteRawSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname + 'Raw',
  Joi.object({
    ...omit(ModuleWriteSchemaObject, ['raw']),
  })
);
