import { Registry, RegistryEntryFactory } from '../util/registry';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const moduleRegistry = new Registry('module');
export const moduleRegistryEntryFactory = new RegistryEntryFactory({
  typeName: 'Module',
  baseDir: __dirname,
  registry: moduleRegistry,
});
