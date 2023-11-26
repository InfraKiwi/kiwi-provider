import { AbstractRegistryEntry } from '../util/registry';
import type { DataSourceContext } from '../dataSources/abstractDataSource';

export abstract class AbstractNotifier<ConfigType> extends AbstractRegistryEntry<ConfigType> {
  abstract notify(context: DataSourceContext): Promise<void>;
}

export type AbstractNotifierInstance = InstanceType<typeof AbstractNotifier>;
