import Joi from 'joi';
import { joiMetaClassName, joiObjectWithPattern } from '../util/joi';
import { InventoryEntrySchema } from './inventoryEntry.schema';
import { VarsContainerSchema } from './varsContainer.schema';

export const groupNameAll = 'all';
export const groupNameGrouped = 'grouped';
export const groupNameUngrouped = 'ungrouped';

export const groupRelationSelfKey = 'self';

export const specialGroupNames = [groupNameAll, groupNameGrouped, groupNameUngrouped];
export const specialGroupNamesSet = new Set(specialGroupNames);

export const InventoryHostSourceSchema = Joi.object().unknown(true).meta({ className: 'InventoryHostSourceInterface' });

export const InventoryGroupStringEntriesSchema = Joi.alternatives([Joi.string(), Joi.array().items(Joi.string())]).meta(
  { className: 'InventoryGroupStringEntriesInterface' },
);

export const InventoryHostSchema = InventoryEntrySchema.meta(joiMetaClassName('InventoryHostInterface'));

export const InventoryGroupSchema = InventoryEntrySchema.append({
  pattern: InventoryGroupStringEntriesSchema,
}).meta({ className: 'InventoryGroupInterface' });

// This schema is for special groups that never define a group of hosts explicitly
export const InventoryGroupSpecialSchema = InventoryEntrySchema.meta({
  className: 'InventoryGroupSpecialInterface',
});

export const InventorySchema = VarsContainerSchema.append({
  hostSources: Joi.array().items(InventoryHostSourceSchema),
  groups: joiObjectWithPattern(
    Joi.alternatives([InventoryGroupStringEntriesSchema, InventoryGroupSpecialSchema, InventoryGroupSchema]),
  ),
}).meta({ className: 'InventoryInterface' });
