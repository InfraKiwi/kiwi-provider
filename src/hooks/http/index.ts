import { HookHTTPSchema } from './schema';
import { hookRegistryEntryFactory } from '../registry';
import type { HookHTTPInterface } from './schema.gen';
import { AbstractHook } from '../abstractHook';
import { DataSourceHTTP } from '../../dataSources/http';
import type { DataSourceContext } from '../../dataSources/abstractDataSource';

export class HookHTTP extends AbstractHook<HookHTTPInterface> {
  #dataSource = new DataSourceHTTP(this.config);

  async notify(context: DataSourceContext): Promise<void> {
    const result = await this.#dataSource.load(context);
    context.logger.info(`HTTP notification sent`, { result });
  }
}

hookRegistryEntryFactory.register(HookHTTPSchema, HookHTTP);
