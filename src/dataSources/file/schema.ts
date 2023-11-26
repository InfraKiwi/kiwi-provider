import Joi from 'joi';
import { dataSourceRegistryEntryFactory } from '../registry';
import { joiMetaClassName } from '../../util/joi';

// This base schema exists for any module that depends on the file source,
// which needs to enforce a non-raw processing of the file
export const DataSourceFileBaseSchema = Joi.object({
  path: Joi.string().required(),
  workDir: Joi.string(),
});

export const DataSourceFileFullSchema = DataSourceFileBaseSchema.append({
  // If true, do not parse the file via a loader
  raw: Joi.boolean(),

  // TODO
  // By default, the data source will try appending each supported extension to the path
  // if the path does not exist as a file. If true, disables this behavior.
  // try: Joi.boolean().default(true),
}).meta(joiMetaClassName('DataSourceFileFullInterface'));

export const DataSourceFileSchema = dataSourceRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  DataSourceFileFullSchema,
);
export const DataSourceFileRawSchema = dataSourceRegistryEntryFactory.createJoiEntrySchema(
  'fileRaw',
  DataSourceFileBaseSchema,
);
