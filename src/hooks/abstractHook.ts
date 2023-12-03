import { AbstractRegistryEntry } from '../util/registry';
import type { DataSourceContext } from '../dataSources/abstractDataSource';

export abstract class AbstractHook<ConfigType> extends AbstractRegistryEntry<ConfigType> {
  abstract notify(context: DataSourceContext): Promise<void>;
}

export type AbstractHookInstance = InstanceType<typeof AbstractHook>;
