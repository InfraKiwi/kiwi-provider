import { Registry, RegistryEntryFactory } from '../util/registry';
import path from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logsStorageRegistry = new Registry(path.basename(__dirname));
export const logsStorageRegistryEntryFactory = new RegistryEntryFactory({
  typeName: 'LogsStorage',
  baseDir: __dirname,
  registry: logsStorageRegistry,
});
