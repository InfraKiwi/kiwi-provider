import { AbstractRegistryEntry } from '../util/registry';
import type { ContextLogger, ContextWorkDir } from '../util/context';

export interface DataSourceContext extends ContextLogger, ContextWorkDir {}

export abstract class AbstractDataSource<ConfigType, ResultType> extends AbstractRegistryEntry<ConfigType> {
  abstract load(context: DataSourceContext): Promise<ResultType>;
}

export abstract class AbstractMultiDataSource<ConfigType, DataType> extends AbstractRegistryEntry<ConfigType> {
  abstract listEntries(context: DataSourceContext): Promise<string[]>;

  abstract loadEntry(context: DataSourceContext, entry: string): Promise<DataType>;

  protected throwEntryNotFound(entry: string) {
    throw new Error(`Entry not found: ${entry}`);
  }

  async loadAllEntries(context: DataSourceContext): Promise<Record<string, DataType>> {
    const result: Record<string, DataType> = {};

    const allEntries = await this.listEntries(context);
    await Promise.all(
      allEntries.map(async (entry) => {
        const data = await this.loadEntry(context, entry);
        result[entry] = data;
      }),
    );

    return result;
  }
}

export type AbstractDataSourceTypes<ResultType> =
  | AbstractDataSource<unknown, ResultType>
  | AbstractMultiDataSource<unknown, ResultType>;

export type AbstractDataSourceInstance =
  | InstanceType<typeof AbstractDataSource>
  | InstanceType<typeof AbstractMultiDataSource>;
