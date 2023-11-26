import { hostSourceRegistryEntryFactory } from '../registry';
import { MultiDataSourceHTTPListArgsSchema } from '../../dataSources/httpList/schema';

export const HostSourceHTTPSchema = hostSourceRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  MultiDataSourceHTTPListArgsSchema,
  {
    label: 'HostSourceHTTPInterface',
  },
);
