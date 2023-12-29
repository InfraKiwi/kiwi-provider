/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { VarsSourceSchema } from './varsSource.schema';
import type { VarsSourceInterface } from './varsSource.schema.gen';
import { AbstractTemplate, extractAllTemplates } from '../util/tpl';
import { dataSourceRegistry } from '../dataSources/registry';
import type { AbstractDataSourceTypes, DataSourceContext } from '../dataSources/abstractDataSource';
import { AbstractMultiDataSource } from '../dataSources/abstractDataSource';
import Joi from 'joi';
import type { VarsInterface } from './varsContainer.schema.gen';
import { VarsSchema } from './varsContainer.schema';

export class VarsSource {
  config: VarsSourceInterface;
  source: AbstractDataSourceTypes<VarsInterface>;

  constructor(config: VarsSourceInterface) {
    this.config = Joi.attempt(config, VarsSourceSchema);
    this.source = dataSourceRegistry.getRegistryEntryInstanceFromIndexedConfig<AbstractDataSourceTypes<VarsInterface>>(
      this.config,
      VarsSourceSchema,
      'vars source'
    );
  }

  static #processLoadedValues(value: VarsInterface, config: VarsSourceInterface): VarsInterface {
    const vars: VarsInterface = {};
    if (config.template) {
      value = extractAllTemplates(value);
    }
    if (typeof value != 'object' || value instanceof AbstractTemplate) {
      Object.assign(vars, { content: value });
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
        if (this.config.flatten) {
          Object.assign(vars, VarsSource.#processLoadedValues(records[key], this.config));
        } else {
          vars[key] = VarsSource.#processLoadedValues(records[key], this.config);
        }
      }
    } else {
      context.logger?.debug(`Loading vars from data source ${source.registryEntry.entryName}`);
      const value = Joi.attempt(await source.loadVars(context), VarsSchema, 'Error validating vars:');
      if (this.config.flatten) {
        for (const key in value) {
          vars[key] = VarsSource.#processLoadedValues(value[key], this.config);
        }
      } else {
        Object.assign(vars, VarsSource.#processLoadedValues(value, this.config));
      }
    }

    return vars;
  }
}
