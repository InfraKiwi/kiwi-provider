import { Registry, RegistryEntryFactory } from '../util/registry';
import path from 'node:path';

export const dataSourceRegistry = new Registry(path.basename(__dirname));

export const dataSourceRegistryEntryFactory = new RegistryEntryFactory({
  typeName: 'DataSource',
  baseDir: __dirname,
  registry: dataSourceRegistry,
});

export const multiDataSourceRegistryEntryFactory = new RegistryEntryFactory({
  typeName: 'MultiDataSource',
  baseDir: __dirname,
  registry: dataSourceRegistry,
});
