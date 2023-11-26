import { newDebug } from '../../util/debug';
import { HostSourceRawSchema } from './schema';
import type { HostSourceRawInterface, HostSourceRawInterfaceConfigKey } from './schema.gen';
import { hostSourceRegistryEntryFactory } from '../registry';

import { InventoryHost } from '../../components/inventoryHost';
import type { HostSourceContext } from '../abstractHostSource';
import { AbstractHostSource } from '../abstractHostSource';
import type { VarsInterface } from '../../components/varsContainer.schema.gen';

const debug = newDebug(__filename);

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
