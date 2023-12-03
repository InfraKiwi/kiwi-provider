import { Registry, RegistryEntryFactory } from '../util/registry';
import path from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const assetsDistributionRegistry = new Registry(path.basename(__dirname));
export const assetsDistributionRegistryEntryFactory = new RegistryEntryFactory({
  typeName: 'AssetsDistribution',
  baseDir: __dirname,
  registry: assetsDistributionRegistry,
});
