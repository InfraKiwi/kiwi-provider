import { Registry, RegistryEntryFactory } from '../util/registry';

export const dataSourceRegistry = new Registry('data source');

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
