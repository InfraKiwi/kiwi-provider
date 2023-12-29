/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { HostSourceRawSchema } from './schema';
import type { HostSourceRawInterface, HostSourceRawInterfaceConfigKey } from './schema.gen';
import { hostSourceRegistryEntryFactory } from '../registry';

import { InventoryHost } from '../../components/inventoryHost';
import type { HostSourceContext } from '../abstractHostSource';
import { AbstractHostSource } from '../abstractHostSource';
import type { VarsInterface } from '../../components/varsContainer.schema.gen';

export class HostSourceRaw extends AbstractHostSource<HostSourceRawInterface, HostSourceRawInterfaceConfigKey> {
  async loadHostsStubs(context: HostSourceContext): Promise<Record<string, InventoryHost>> {
    const entries = Object.keys(this.config);
    return entries.reduce((acc: Record<string, InventoryHost>, el) => {
      acc[el] = new InventoryHost(el, {}, this);
      return acc;
    }, {});
  }

  async loadHostVars(context: HostSourceContext, host: InventoryHost): Promise<VarsInterface> {
    return this.config[host.id];
  }
}

hostSourceRegistryEntryFactory.register(HostSourceRawSchema, HostSourceRaw);
