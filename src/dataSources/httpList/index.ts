import { newDebug } from '../../util/debug';
import { multiDataSourceRegistryEntryFactory } from '../registry';
import { MultiDataSourceHTTPListSchemaDefaultIdTag, MultiDataSourceHTTPListSchema } from './schema';
import type { MultiDataSourceHTTPListInterface } from './schema.gen';
import { DataSourceHTTP } from '../http';
import Joi from 'joi';
import traverse from 'traverse';
import type { DataSourceHTTPInterface } from '../http/schema.gen';
import type { DataSourceContext } from '../abstractDataSource';
import { AbstractMultiDataSource } from '../abstractDataSource';

const debug = newDebug(__filename);

const responseSchemaArrayOfStrings = Joi.array().items(Joi.string());

export class MultiDataSourceHTTPList<DataType> extends AbstractMultiDataSource<
  MultiDataSourceHTTPListInterface,
  DataType
> {
  #entriesCache?: Record<string, DataType>;

  async listEntries(context: DataSourceContext): Promise<string[]> {
    const { idField, ...rest } = this.config.list;

    const dataSourceList = new DataSourceHTTP({
      ...this.config.default,
      ...rest,
    });

    const result = await dataSourceList.load(context);

    /*
    We accept different responses from the list call:

    - If the response is an array:
      - If all items are strings, we treat those strings as IDs
      - If the idPath is set we use that path as reference to extract IDs from each array entry, and
        use the rest of the object as source for each entry object
    - If the response is an object, we treat the keys as IDs and each value as the entry object

     */

    const data = result.data;
    if (Array.isArray(data)) {
      if (responseSchemaArrayOfStrings.validate(data).error == null) {
        return data;
      }

      if (idField) {
        this.#entriesCache = {};
        for (const entry of data) {
          const { [idField]: id, ...rest } = entry;
          if (typeof id != 'string') {
            throw new Error(
              `The HTTP data source list call returned an array of objects, and the field extracted using the \`idField\` path was not a string: ${id}`,
            );
          }
          this.#entriesCache[id] = rest;
        }
        return Object.keys(this.#entriesCache);
      }

      throw new Error(
        "The HTTP data source list call returned an array of object, but no `idField` path was configured to extract each object's id",
      );
    }

    if (data && typeof data == 'object') {
      this.#entriesCache = data as Record<string, DataType>;
      return Object.keys(this.#entriesCache);
    }

    throw new Error(`The HTTP data source list call returned a \`${typeof data}\`, which is not supported`);
  }

  async loadEntry(context: DataSourceContext, entry: string): Promise<DataType> {
    if (this.#entriesCache && entry in this.#entriesCache) {
      return this.#entriesCache[entry];
    }

    const { idTag, ...rest } = this.config.load || {};

    // Process all fields that may contain a template
    const config: DataSourceHTTPInterface = traverse({
      ...this.config.default,
      ...rest,
    }).map(function (val) {
      if (this.notLeaf || typeof val != 'string') {
        return;
      }
      this.update(val.replaceAll(idTag ?? MultiDataSourceHTTPListSchemaDefaultIdTag, entry));
    });

    const dataSourceLoad = new DataSourceHTTP(config);

    const result = await dataSourceLoad.load(context);
    return result.data as DataType;
  }
}

multiDataSourceRegistryEntryFactory.register(MultiDataSourceHTTPListSchema, MultiDataSourceHTTPList);
