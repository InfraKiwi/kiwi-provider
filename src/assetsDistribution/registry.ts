import { Registry, RegistryEntryFactory } from '../util/registry';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const assetsDistributionRegistry = new Registry('assets distribution');
export const assetsDistributionRegistryEntryFactory = new RegistryEntryFactory({
  typeName: 'AssetsDistribution',
  baseDir: __dirname,
  registry: assetsDistributionRegistry,
});
