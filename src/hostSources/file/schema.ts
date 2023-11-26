import { hostSourceRegistryEntryFactory } from '../registry';
import { DataSourceFileBaseSchema } from '../../dataSources/file/schema';

export const HostSourceFileSchema = hostSourceRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  DataSourceFileBaseSchema,
);
