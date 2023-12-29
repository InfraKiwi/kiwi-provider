/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { InventoryEntry } from './inventoryEntry';

import type { DataSourceContext } from '../dataSources/abstractDataSource';
import type { InventoryGroupInterface } from './inventory.schema.gen';
import Joi from 'joi';
import { InventoryGroupSchema } from './inventory.schema';
import { joiKeepOnlyKeysInJoiSchema } from '../util/joi';
import { InventoryEntrySchema } from './inventoryEntry.schema';

export class InventoryGroup extends InventoryEntry {
  readonly pattern: string[];

  constructor(id: string, config: InventoryGroupInterface) {
    config = Joi.attempt(config, InventoryGroupSchema, 'Error validating inventory group config: ');
    super(id, joiKeepOnlyKeysInJoiSchema(config, InventoryEntrySchema));
    this.pattern = config.pattern ? (Array.isArray(config.pattern) ? config.pattern : [config.pattern]) : [];
  }

  protected async internalLoadVars(context: DataSourceContext): Promise<void> {
    // NOOP
  }
}
