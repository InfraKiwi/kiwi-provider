import Joi from 'joi';
import { DataSourceFileSchema } from './file/schema';
import { DataSourceFileRawSchema } from './file/schema';
import { MultiDataSourceGlobSchema } from './glob/schema';
import { DataSourceHTTPSchema } from './http/schema';
import { MultiDataSourceHTTPListSchema } from './httpList/schema';

export const registryEntriesDataSourcesSchema = Joi.object({
  file: DataSourceFileSchema,
  fileRaw: DataSourceFileRawSchema,
  glob: MultiDataSourceGlobSchema,
  http: DataSourceHTTPSchema,
  httpList: MultiDataSourceHTTPListSchema,
}).meta({ className: 'registryEntriesDataSourcesInterface' });
