/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

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
    context.logger.info('HTTP notification sent', { result });
  }
}

hookRegistryEntryFactory.register(HookHTTPSchema, HookHTTP);
