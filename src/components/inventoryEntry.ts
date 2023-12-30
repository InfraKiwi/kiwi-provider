/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { InventoryEntryInterface, InventoryEntryRelationsInterface } from './inventoryEntry.schema.gen';
import { InventoryEntryRelationsSchema, InventoryEntrySchema } from './inventoryEntry.schema';
import { VarsContainer } from './varsContainer';
import type { DataSourceContext } from '../dataSources/abstractDataSource';
import type { VarsInterface } from './varsContainer.schema.gen';
import { joiAttemptRequired, joiKeepOnlyKeysInJoiSchema } from '../util/joi';
import { VarsContainerSchema } from './varsContainer.schema';

export abstract class InventoryEntry extends VarsContainer {
  readonly id: string;
  readonly #config: InventoryEntryInterface;

  #relations?: InventoryEntryRelationsInterface;

  protected constructor(id: string, config: InventoryEntryInterface) {
    config = joiAttemptRequired(config, InventoryEntrySchema, 'validate inventory entry config');
    super(joiKeepOnlyKeysInJoiSchema(config, VarsContainerSchema));

    this.#config = config;
    this.id = id;
    this.#relations = config.relations;
  }

  async loadVars(context: DataSourceContext): Promise<VarsInterface> {
    await super.loadVars(context);
    if (this.#config.varsKeyRelations && this.#config.varsKeyRelations in this.vars) {
      this.relations = joiAttemptRequired(this.vars[this.#config.varsKeyRelations], InventoryEntryRelationsSchema);
    }
    return this.vars;
  }

  set relations(relations: InventoryEntryRelationsInterface) {
    this.#relations = relations;
  }

  get relations(): InventoryEntryRelationsInterface {
    return this.#relations ?? [];
  }
}
