import { Registry, RegistryEntryFactory } from '../util/registry';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const recipeSourceRegistry = new Registry('recipeSource');
export const recipeSourceRegistryEntryFactory = new RegistryEntryFactory({
  typeName: 'recipeSource',
  baseDir: __dirname,
  registry: recipeSourceRegistry,
});
