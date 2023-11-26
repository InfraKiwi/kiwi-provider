import { hostSourceRegistryEntryFactory } from '../registry';
import { MultiDataSourceGlobSchema } from '../../dataSources/glob/schema';

export const HostSourceGlobSchema = hostSourceRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  MultiDataSourceGlobSchema,
);
