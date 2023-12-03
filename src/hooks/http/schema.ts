import { hookRegistryEntryFactory } from '../registry';
import { DataSourceHTTPRawSchema } from '../../dataSources/http/schema';

export const HookHTTPSchema = hookRegistryEntryFactory.createJoiEntrySchema(__dirname, DataSourceHTTPRawSchema, {
  label: 'HookHTTPInterface',
});
