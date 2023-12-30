/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { InventoryEntry } from './inventoryEntry';
import type { Inventory } from './inventory';
import type { AbstractHostSourceInstance } from '../hostSources/abstractHostSource';
import type { DataSourceContext } from '../dataSources/abstractDataSource';
import { joiAttemptRequired, joiKeepOnlyKeysInJoiSchema } from '../util/joi';
import { VarsContainerSchema } from './varsContainer.schema';
import { InventoryHostSchema, specialGroupNames } from './inventory.schema';
import type { InventoryHostInterface } from './inventory.schema.gen';
import type { ContextLogger } from '../util/context';

export class InventoryHost extends InventoryEntry {
  readonly #hostSource?: AbstractHostSourceInstance;

  #hostSourceMetadata?: unknown;
  #groupNamesCache?: string[];

  constructor(id: string, config: InventoryHostInterface, hostSource?: AbstractHostSourceInstance) {
    config = joiAttemptRequired(config, InventoryHostSchema, 'Error validating inventory host config: ');
    super(id, joiKeepOnlyKeysInJoiSchema(config, VarsContainerSchema));
    this.#hostSource = hostSource;
  }

  get hostSource(): AbstractHostSourceInstance | undefined {
    return this.#hostSource;
  }

  get hostSourceMetadata(): unknown {
    return this.#hostSourceMetadata;
  }

  set hostSourceMetadata(value: unknown) {
    this.#hostSourceMetadata = value;
  }

  protected async internalLoadVars(context: DataSourceContext): Promise<void> {
    await this.#hostSource?.populateHostData(context, this);
  }

  loadGroupNamesFromInventory(context: ContextLogger, inventory: Inventory) {
    if (this.#groupNamesCache) {
      return;
    }
    this.#groupNamesCache = inventory.getGroupNamesForHost(context, this, undefined, true);
  }

  get groupNamesCacheLoaded(): boolean {
    return this.#groupNamesCache != null;
  }

  get groupNames(): string[] {
    if (this.#groupNamesCache == null) {
      throw new Error('Groups not preloaded for host');
    }
    return this.#groupNamesCache;
  }

  get groupNamesWithoutSpecialGroups(): string[] {
    return this.groupNames.filter((g) => !(specialGroupNames as unknown as string[]).includes(g));
  }
}
