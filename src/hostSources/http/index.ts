import { newDebug } from '../../util/debug';
import { HostSourceHTTPSchema } from './schema';
import { hostSourceRegistryEntryFactory } from '../registry';

import { InventoryHost } from '../../components/inventoryHost';
import type { HostSourceContext } from '../abstractHostSource';
import { AbstractHostSource } from '../abstractHostSource';
import { MultiDataSourceHTTPList } from '../../dataSources/httpList';
import type { VarsInterface } from '../../components/varsContainer.schema.gen';
import type { HostSourceHTTPInterface, HostSourceHTTPInterfaceConfigKey } from './schema.gen';

const debug = newDebug(__filename);

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
