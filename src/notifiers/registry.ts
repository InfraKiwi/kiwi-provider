import { Registry, RegistryEntryFactory } from '../util/registry';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const notifierRegistry = new Registry('assets distribution');
export const notifierRegistryEntryFactory = new RegistryEntryFactory({
  typeName: 'Notifier',
  baseDir: __dirname,
  registry: notifierRegistry,
});
