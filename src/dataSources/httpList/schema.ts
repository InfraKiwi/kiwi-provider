import Joi from 'joi';
import { multiDataSourceRegistryEntryFactory } from '../registry';
import { DataSourceHTTPRawSchema } from '../http/schema';
import { joiMetaClassName } from '../../util/joi';

export const MultiDataSourceHTTPListSchemaDefaultIdTag = '{{ id }}';
export const MultiDataSourceHTTPListArgsSchema = Joi.object({
  default: DataSourceHTTPRawSchema,

  list: DataSourceHTTPRawSchema.append({
    idField: Joi.string(),
  }).required(),

  load: DataSourceHTTPRawSchema.append({
    idTag: Joi.string().default(MultiDataSourceHTTPListSchemaDefaultIdTag).optional(),
  }),
}).meta(joiMetaClassName('MultiDataSourceHTTPListArgsInterface'));

export const MultiDataSourceHTTPListSchema = multiDataSourceRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  MultiDataSourceHTTPListArgsSchema,
  { label: 'MultiDataSourceHTTPListInterface' },
);
