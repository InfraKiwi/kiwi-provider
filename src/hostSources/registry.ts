import { Registry, RegistryEntryFactory } from '../util/registry';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const hostSourceRegistry = new Registry('host source');
export const hostSourceRegistryEntryFactory = new RegistryEntryFactory({
  typeName: 'HostSource',
  baseDir: __dirname,
  registry: hostSourceRegistry,
});
