/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { HostSourceHTTPSchema } from './schema';
import { hostSourceRegistryEntryFactory } from '../registry';

import { InventoryHost } from '../../components/inventoryHost';
import type { HostSourceContext } from '../abstractHostSource';
import { AbstractHostSource } from '../abstractHostSource';
import { MultiDataSourceHTTPList } from '../../dataSources/httpList';
import type { VarsInterface } from '../../components/varsContainer.schema.gen';
import type { HostSourceHTTPInterface, HostSourceHTTPInterfaceConfigKey } from './schema.gen';

export class HostSourceHTTP extends AbstractHostSource<HostSourceHTTPInterface, HostSourceHTTPInterfaceConfigKey> {
  #ds = new MultiDataSourceHTTPList<VarsInterface>(this.config);

  async loadHostsStubs(context: HostSourceContext): Promise<Record<string, InventoryHost>> {
    const entries = await this.#ds.listEntries(context);
    return entries.reduce((acc: Record<string, InventoryHost>, el) => {
      acc[el] = new InventoryHost(el, {}, this);
      return acc;
    }, {});
  }

  async loadHostVars(context: HostSourceContext, host: InventoryHost): Promise<VarsInterface> {
    return await this.#ds.loadEntry(context, host.id);
  }
}

hostSourceRegistryEntryFactory.register(HostSourceHTTPSchema, HostSourceHTTP);
