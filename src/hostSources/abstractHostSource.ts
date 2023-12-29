/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { WrapperInterfaceWithConfigKey } from '../util/registry';
import { AbstractRegistryEntryWrappedConfig } from '../util/registry';
import type { InventoryHost } from '../components/inventoryHost';
import type { ContextLogger, ContextWorkDir } from '../util/context';
import type { HostSourceWrapperInterface } from './abstractHostSource.schema.gen';
import { hostSourceRegistry } from './registry';
import { HostSourceWrapperSchema } from './abstractHostSource.schema';
import type { VarsInterface } from '../components/varsContainer.schema.gen';

export interface HostSourceContext extends ContextLogger, ContextWorkDir {}

export abstract class AbstractHostSource<
  ConfigType,
  ConfigKey extends string,
> extends AbstractRegistryEntryWrappedConfig<HostSourceWrapperInterface, ConfigType, ConfigKey> {
  constructor(config: WrapperInterfaceWithConfigKey<HostSourceWrapperInterface, ConfigType, ConfigKey> | string) {
    super(hostSourceRegistry, HostSourceWrapperSchema, config);
  }

  abstract loadHostsStubs(context: HostSourceContext): Promise<Record<string, InventoryHost>>;

  abstract loadHostVars(context: HostSourceContext, host: InventoryHost): Promise<VarsInterface>;

  async populateHostData(context: HostSourceContext, host: InventoryHost) {
    host.vars = await this.loadHostVars(context, host);
  }

  async loadAllHosts(context: HostSourceContext): Promise<Record<string, InventoryHost>> {
    const hosts = await this.loadHostsStubs(context);
    await Promise.all(Object.values(hosts).map((host) => host.loadVars(context)));
    return hosts;
  }

  protected throwHostnameNotFound(entry: string) {
    throw new Error(`Hostname not found: ${entry}`);
  }
}

export type AbstractHostSourceInstance = InstanceType<typeof AbstractHostSource>;
