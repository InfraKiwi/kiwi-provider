/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { multiDataSourceRegistryEntryFactory } from '../registry';
import { MultiDataSourceHTTPListSchema, MultiDataSourceHTTPListSchemaDefaultIdTag } from './schema';
import type { MultiDataSourceHTTPListInterface } from './schema.gen';
import { DataSourceHTTP } from '../http';
import Joi from 'joi';
import traverse from 'traverse';
import type { DataSourceHTTPInterface } from '../http/schema.gen';
import type { DataSourceContext } from '../abstractDataSource';
import { AbstractMultiDataSource } from '../abstractDataSource';

const responseSchemaArrayOfStrings = Joi.array().items(Joi.string());
const responseSchemaArrayOfNumbers = Joi.array().items(Joi.number());

export class MultiDataSourceHTTPList<DataType> extends AbstractMultiDataSource<
  MultiDataSourceHTTPListInterface,
  DataType
> {
  #entriesCache: Record<string, DataType | null> = {};

  async listEntries(context: DataSourceContext): Promise<string[]> {
    const { idField, http } = this.config.list;

    const dataSourceList = new DataSourceHTTP({
      ...this.config.default,
      ...http,
    });

    const data = await dataSourceList.loadVars(context);

    /*
     *We accept different responses from the list call:
     *
     *- If the response is an array:
     *  - If all items are strings, we treat those strings as IDs
     *  - If the idPath is set we use that path as reference to extract IDs from each array entry, and
     *    use the rest of the object as source for each entry object
     *- If the response is an object, we treat the keys as IDs and each value as the entry object
     *
     */
    if (Array.isArray(data)) {
      if (responseSchemaArrayOfStrings.validate(data).error == null) {
        return data;
      }
      if (responseSchemaArrayOfNumbers.validate(data).error == null) {
        return (data as number[]).map((el) => el.toString());
      }

      if (idField) {
        for (const entry of data) {
          const { [idField]: id, ...rest } = entry;
          this.#entriesCache[id] = this.config.load == null ? rest : null;
        }
        return Object.keys(this.#entriesCache);
      }

      throw new Error(
        'The HTTP data source list call returned an array of objects, but no `idField` path was configured to extract each object\'s id'
      );
    }

    if (data && typeof data == 'object') {
      for (const dataKey in data) {
        this.#entriesCache[dataKey] = this.config.load == null ? (data as Record<string, DataType>)[dataKey] : null;
      }
      return Object.keys(this.#entriesCache);
    }

    throw new Error(`The HTTP data source list call returned a \`${typeof data}\`, which is not supported`);
  }

  async loadEntry(context: DataSourceContext, entry: string): Promise<DataType> {
    const cacheEntry = this.#entriesCache[entry];
    if (cacheEntry != null) {
      return cacheEntry;
    }

    const { idTag, http } = this.config.load ?? {};

    // Process all fields that may contain a template
    const config: DataSourceHTTPInterface = traverse({
      ...this.config.default,
      ...http,
    }).map(function (val) {
      if (this.notLeaf || typeof val != 'string') {
        return;
      }
      this.update(val.replaceAll(idTag ?? MultiDataSourceHTTPListSchemaDefaultIdTag, entry));
    });

    const dataSourceLoad = new DataSourceHTTP(config);

    const data = (await dataSourceLoad.loadVars(context)) as DataType;
    this.#entriesCache[entry] = data;
    return data;
  }
}

multiDataSourceRegistryEntryFactory.register(MultiDataSourceHTTPListSchema, MultiDataSourceHTTPList);
