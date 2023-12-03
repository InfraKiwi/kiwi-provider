import { Registry, RegistryEntryFactory } from '../util/registry';
import path from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const recipeSourceRegistry = new Registry(path.basename(__dirname));
export const recipeSourceRegistryEntryFactory = new RegistryEntryFactory({
  typeName: 'recipeSource',
  baseDir: __dirname,
  registry: recipeSourceRegistry,
});
