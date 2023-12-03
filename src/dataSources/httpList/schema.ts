import Joi from 'joi';
import { multiDataSourceRegistryEntryFactory } from '../registry';
import { DataSourceHTTPRawSchema } from '../http/schema';
import { joiMetaClassName } from '../../util/joi';

export const MultiDataSourceHTTPListSchemaDefaultIdTag = '{{ id }}';
export const MultiDataSourceHTTPListArgsSchema = Joi.object({
  default: DataSourceHTTPRawSchema.description(`Any default values to use for both \`list\` and \`load\` calls.`),

  list: Joi.object({
    idField: Joi.string().description(`
If the response is an array of objects, this is the name of the field
of each object that will be used to extract each entry's id.
`),
    http: DataSourceHTTPRawSchema.description(`
    The configuration of the list HTTP call.
    `),
  }).required().description(`
The HTTP call to make when loading the list of available entries.
`),

  load: Joi.object({
    idTag: Joi.string().default(MultiDataSourceHTTPListSchemaDefaultIdTag).optional().description(`
The tag to use in the HTTP call, which will be replaced by the entry id
obtained in the \`list\` call.
`),
    http: DataSourceHTTPRawSchema.description(`
    The configuration of the load HTTP call.
    `),
  }).description(`
The HTTP call to make when loading the data for an entry returned by the 
\`list\` call. If not provided, the response of the \`list\` call will be 
used also to extract the data related to each entry.
`),
}).meta(joiMetaClassName('MultiDataSourceHTTPListArgsInterface'));

export const MultiDataSourceHTTPListSchema = multiDataSourceRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  MultiDataSourceHTTPListArgsSchema,
  { label: 'MultiDataSourceHTTPListInterface' },
);
