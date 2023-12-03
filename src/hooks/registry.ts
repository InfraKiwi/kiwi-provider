import { Registry, RegistryEntryFactory } from '../util/registry';
import path from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const hookRegistry = new Registry(path.basename(__dirname));
export const hookRegistryEntryFactory = new RegistryEntryFactory({
  typeName: 'Hook',
  baseDir: __dirname,
  registry: hookRegistry,
});
