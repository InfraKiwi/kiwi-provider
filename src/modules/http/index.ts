/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunContext } from '../../util/runContext';
import { ModuleHTTPSchema } from './schema';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleHTTPInterface } from './schema.gen';

import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import type { DataSourceHTTPResult } from '../../dataSources/http';
import { DataSourceHTTP } from '../../dataSources/http';

export interface ModuleHTTPResult extends DataSourceHTTPResult {}

export class ModuleHTTP extends AbstractModuleBase<ModuleHTTPInterface, ModuleHTTPResult> {
  #dataSource = new DataSourceHTTP(this.config);

  async run(context: RunContext): Promise<ModuleRunResult<ModuleHTTPResult>> {
    const result = await this.#dataSource.load(context);

    return {
      vars: result,
      changed: true,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleHTTPSchema, ModuleHTTP);
