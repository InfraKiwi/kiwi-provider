import { newDebug } from '../../util/debug';
import { moduleRegistryEntryFactory } from '../registry';
import { DataSourceHTTPRawSchema } from '../../dataSources/http/schema';

const debug = newDebug(__filename);

export const ModuleHTTPSchema = moduleRegistryEntryFactory.createJoiEntrySchema(__dirname, DataSourceHTTPRawSchema, {
  label: 'ModuleHTTPInterface',
});
