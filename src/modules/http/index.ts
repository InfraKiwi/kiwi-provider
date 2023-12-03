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
