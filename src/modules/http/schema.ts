import { moduleRegistryEntryFactory } from '../registry';
import { DataSourceHTTPRawSchema } from '../../dataSources/http/schema';

export const ModuleHTTPSchema = moduleRegistryEntryFactory.createJoiEntrySchema(__dirname, DataSourceHTTPRawSchema, {
  label: 'ModuleHTTPInterface',
});
