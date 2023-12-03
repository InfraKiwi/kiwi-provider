import { Registry, RegistryEntryFactory } from '../util/registry';
import path from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const runnerRegistry = new Registry(path.basename(__dirname));
export const runnerRegistryEntryFactory = new RegistryEntryFactory({
  typeName: 'Runner',
  baseDir: __dirname,
  registry: runnerRegistry,
});
