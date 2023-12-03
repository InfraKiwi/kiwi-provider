import { moduleRegistryEntryFactory } from '../registry';
import Joi from 'joi';
import { AxiosRequestSchemaObject } from '../../util/axios.schema';
import { getJoiEnumValues, joiMetaClassName } from '../../util/joi';
import { UnarchiveArchiveType } from '../../util/unarchive';

export const ModuleDownloadHTTPRequestSchema = Joi.object(AxiosRequestSchemaObject)
  .required()
  .meta(joiMetaClassName('ModuleDownloadHTTPRequestInterface'));

export const ModuleDownloadSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    http: ModuleDownloadHTTPRequestSchema.description(`The HTTP call configuration`),

    dest: Joi.string().description(`
    The path where to save the file. If not provided, the module will download
    the file into a temporary directory and the value will be provided in the
    module's result \`path\` variable. 
    `),

    extract: getJoiEnumValues(UnarchiveArchiveType).description(
      `If an archive type is provided, treat the downloaded file as an archive and extract it to \`dest\`, which must be a directory.`,
    ),
  }),
  { label: 'ModuleDownloadInterface' },
);
