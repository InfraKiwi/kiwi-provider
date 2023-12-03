import { Registry, RegistryEntryFactory } from '../util/registry';
import path from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const moduleRegistry = new Registry(path.basename(__dirname));
export const moduleRegistryEntryFactory = new RegistryEntryFactory({
  typeName: 'Module',
  baseDir: __dirname,
  registry: moduleRegistry,
});
