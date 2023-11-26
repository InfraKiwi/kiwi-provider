import { Registry, RegistryEntryFactory } from '../util/registry';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logsStorageRegistry = new Registry('assets distribution');
export const logsStorageRegistryEntryFactory = new RegistryEntryFactory({
  typeName: 'LogsStorage',
  baseDir: __dirname,
  registry: logsStorageRegistry,
});
