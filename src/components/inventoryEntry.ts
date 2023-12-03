import { newDebug } from '../util/debug';
import type { InventoryEntryInterface, InventoryEntryRelationsInterface } from './inventoryEntry.schema.gen';
import Joi from 'joi';
import { InventoryEntryRelationsSchema, InventoryEntrySchema } from './inventoryEntry.schema';
import { VarsContainer } from './varsContainer';
import type { DataSourceContext } from '../dataSources/abstractDataSource';
import type { VarsInterface } from './varsContainer.schema.gen';
import { joiKeepOnlyKeysInJoiSchema } from '../util/joi';
import { VarsContainerSchema } from './varsContainer.schema';

const debug = newDebug(__filename);

export abstract class InventoryEntry extends VarsContainer {
  readonly id: string;
  readonly #config: InventoryEntryInterface;

  #relations?: InventoryEntryRelationsInterface;

  protected constructor(id: string, config: InventoryEntryInterface) {
    config = Joi.attempt(config, InventoryEntrySchema, 'validate inventory entry config');
    super(joiKeepOnlyKeysInJoiSchema(config, VarsContainerSchema));

    this.#config = config;
    this.id = id;
    this.#relations = config.relations;
  }

  async loadVars(context: DataSourceContext): Promise<VarsInterface> {
    await super.loadVars(context);
    if (this.#config.varsKeyRelations && this.#config.varsKeyRelations in this.vars) {
      this.relations = Joi.attempt(this.vars[this.#config.varsKeyRelations], InventoryEntryRelationsSchema);
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
