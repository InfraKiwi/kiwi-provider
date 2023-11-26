import { newDebug } from '../../util/debug';
import { notifierRegistryEntryFactory } from '../registry';
import { DataSourceHTTPRawSchema } from '../../dataSources/http/schema';

const debug = newDebug(__filename);

export const NotifierHTTPSchema = notifierRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  DataSourceHTTPRawSchema,
  {
    label: 'NotifierHTTPInterface',
  },
);
