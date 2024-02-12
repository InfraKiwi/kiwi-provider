/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { hostSourceRegistryEntryFactory } from '../registry';
import path from 'node:path';
import type { HostSourceFileInterface, HostSourceFileInterfaceConfigKey } from './schema.gen';
import type { VarsInterface } from '../../components/varsContainer.schema.gen';
import { HostSourceFileSchema } from './schema';

import { InventoryHost } from '../../components/inventoryHost';
import type { HostSourceContext } from '../abstractHostSource';
import { AbstractHostSource } from '../abstractHostSource';
import { DataSourceFile } from '../../dataSources/file';

export class HostSourceFile extends AbstractHostSource<HostSourceFileInterface, HostSourceFileInterfaceConfigKey> {
  #ds = new DataSourceFile<VarsInterface>(this.config);

  static extractHostnameFromFilename(filePath: string): string {
    const extension = path.extname(filePath);
    const hostname = path.basename(filePath, extension);
    return hostname;
  }

  async getHostname(context: HostSourceContext): Promise<string> {
    const filePath = await this.#ds.findValidFilePath(context);
    return path.basename(filePath, path.extname(filePath));
  }

  async loadHostsStubs(context: HostSourceContext): Promise<Record<string, InventoryHost>> {
    const hostname = await this.getHostname(context);
    const host = new InventoryHost(hostname, {}, this);
    const metadata = this.config;
    host.hostSourceMetadata = metadata;
    return { [hostname]: host };
  }

  async loadHostVars(context: HostSourceContext, host: InventoryHost): Promise<VarsInterface> {
    const hostname = await this.getHostname(context);
    if (host.id != hostname) {
      this.throwHostnameNotFound(host.id);
    }
    return await this.#ds.loadVars(context);
  }
}

hostSourceRegistryEntryFactory.register(HostSourceFileSchema, HostSourceFile);
