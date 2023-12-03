import { Registry, RegistryEntryFactory } from '../util/registry';
import path from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const hostSourceRegistry = new Registry(path.basename(__dirname));
export const hostSourceRegistryEntryFactory = new RegistryEntryFactory({
  typeName: 'HostSource',
  baseDir: __dirname,
  registry: hostSourceRegistry,
});
