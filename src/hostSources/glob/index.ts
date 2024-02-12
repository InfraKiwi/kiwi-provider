/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { HostSourceGlobSchema } from './schema';
import { hostSourceRegistryEntryFactory } from '../registry';
import type { HostSourceGlobInterface, HostSourceGlobInterfaceConfigKey } from './schema.gen';
import type { VarsInterface } from '../../components/varsContainer.schema.gen';
import { HostSourceFile } from '../file';

import { InventoryHost } from '../../components/inventoryHost';
import type { HostSourceContext } from '../abstractHostSource';
import { AbstractHostSource } from '../abstractHostSource';
import { MultiDataSourceGlob } from '../../dataSources/glob';

interface HostSourceGlobMetadata {
  originalFilename: string;
}

export class HostSourceGlob extends AbstractHostSource<HostSourceGlobInterface, HostSourceGlobInterfaceConfigKey> {
  #ds = new MultiDataSourceGlob<VarsInterface>(this.config);

  async loadHostsStubs(context: HostSourceContext): Promise<Record<string, InventoryHost>> {
    const entries = await this.#ds.listEntries(context);
    return entries.reduce((acc: Record<string, InventoryHost>, el) => {
      const hostname = HostSourceFile.extractHostnameFromFilename(el);
      const host = new InventoryHost(hostname, {}, this);
      const metadata: HostSourceGlobMetadata = { originalFilename: el };
      host.hostSourceMetadata = metadata;
      acc[hostname] = host;
      return acc;
    }, {});
  }

  async loadHostVars(context: HostSourceContext, host: InventoryHost): Promise<VarsInterface> {
    return await this.#ds.loadEntry(context, (host.hostSourceMetadata as HostSourceGlobMetadata).originalFilename);
  }
}

hostSourceRegistryEntryFactory.register(HostSourceGlobSchema, HostSourceGlob);
