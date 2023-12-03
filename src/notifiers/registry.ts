import { Registry, RegistryEntryFactory } from '../util/registry';
import path from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const notifierRegistry = new Registry(path.basename(__dirname));
export const notifierRegistryEntryFactory = new RegistryEntryFactory({
  typeName: 'Notifier',
  baseDir: __dirname,
  registry: notifierRegistry,
});
