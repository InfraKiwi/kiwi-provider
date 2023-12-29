/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { AbstractRegistryEntry } from '../util/registry';
import type { ContextLogger, ContextWorkDir } from '../util/context';

export interface DataSourceContext extends ContextLogger, ContextWorkDir {}

export abstract class AbstractDataSource<
  ConfigType,
  ResultType,
  LoadVarsType = ResultType,
> extends AbstractRegistryEntry<ConfigType> {
  abstract load(context: DataSourceContext): Promise<ResultType>;

  /*
   * `getVarsFromLoadResult` can be overridden when a data source returns
   * also additional data other than just vars, and we need to e.g. return
   * a subset of such data.
   */
  protected async getVarsFromLoadResult(result: ResultType): Promise<LoadVarsType> {
    return result as unknown as LoadVarsType;
  }

  // `loadVars` is a utility function invoked to load vars for a varsSource.
  async loadVars(context: DataSourceContext): Promise<LoadVarsType> {
    const loadResult = await this.load(context);
    return this.getVarsFromLoadResult(loadResult);
  }
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
      })
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
