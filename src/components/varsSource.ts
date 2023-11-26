import { VarsSourceSchema } from './varsSource.schema';
import type { VarsSourceInterface } from './varsSource.schema.gen';
import { AbstractTemplate, extractAllTemplates } from '../util/tpl';
import { dataSourceRegistry } from '../dataSources/registry';
import type { AbstractDataSourceTypes, DataSourceContext } from '../dataSources/abstractDataSource';
import { AbstractMultiDataSource } from '../dataSources/abstractDataSource';
import Joi from 'joi';
import type { VarsInterface } from './varsContainer.schema.gen';

export class VarsSource {
  config: VarsSourceInterface;
  source: AbstractDataSourceTypes<VarsInterface>;

  constructor(config: VarsSourceInterface) {
    this.config = Joi.attempt(config, VarsSourceSchema);
    this.source = dataSourceRegistry.getRegistryEntryInstanceFromIndexedConfig<AbstractDataSourceTypes<VarsInterface>>(
      this.config,
      VarsSourceSchema,
      'vars source',
    );
  }

  static #processLoadedValues(value: VarsInterface, config: VarsSourceInterface): VarsInterface {
    const vars: VarsInterface = {};
    if (config.extract) {
      value = extractAllTemplates(value);
    }
    if (typeof value != 'object' || value instanceof AbstractTemplate) {
      Object.assign(vars, {
        content: value,
      });
    } else {
      Object.assign(vars, value);
    }
    return vars;
  }

  async loadVars(context: DataSourceContext): Promise<VarsInterface> {
    const source = this.source;
    const vars: VarsInterface = {};

    if (source instanceof AbstractMultiDataSource) {
      context.logger?.debug(`Loading vars from multi data source ${source.registryEntry.entryName}`);
      const records = await source.loadAllEntries(context);
      for (const key in records) {
        // const value = Joi.attempt(records[key], VarsSchema, 'Error validating vars:');
        Object.assign(vars, VarsSource.#processLoadedValues(records[key], this.config));
      }
    } else {
      context.logger?.debug(`Loading vars from data source ${source.registryEntry.entryName}`);
      const value = await source.load(context); // Joi.attempt(await source.load(context), VarsSchema, 'Error validating vars:');
      Object.assign(vars, VarsSource.#processLoadedValues(value, this.config));
    }

    return vars;
  }
}
