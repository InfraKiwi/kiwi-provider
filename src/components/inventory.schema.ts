import Joi from 'joi';
import { joiMetaClassName, joiObjectWithPattern } from '../util/joi';
import { InventoryEntrySchemaObject } from './inventoryEntry.schema';
import { VarsContainerSchemaObject } from './varsContainer.schema';

export const groupNameAll = 'all';
export const groupNameGrouped = 'grouped';
export const groupNameUngrouped = 'ungrouped';

export const groupRelationSelfKey = 'self';

export const specialGroupNames = [groupNameAll, groupNameGrouped, groupNameUngrouped] as const;

export const specialGroupsDescriptions: Record<(typeof specialGroupNames)[number], string> = {
  [groupNameAll]: 'All hosts.',
  [groupNameGrouped]: 'Hosts that belong to a group.',
  [groupNameUngrouped]: 'Hosts that do not belong to any group.',
};

export const specialGroupNamesSet = new Set(specialGroupNames);

export const InventoryHostSourceSchema = Joi.object().unknown(true).meta({ className: 'InventoryHostSourceInterface' });

export const InventoryGroupStringEntriesSchema = Joi.alternatives([
  Joi.string().description(`A single pattern.`).example(`
  groups:
    myGroup: loadbalancer-az*.hello.com
  `),
  Joi.array().items(Joi.string()).description(`An array of patterns.`).example(`
  groups:
    myGroup:
      - loadbalancer-az*.hello.com
      - loadbalancer-global*.hello.com
`),
])
  .meta({ className: 'InventoryGroupStringEntriesInterface' })
  .description(`The pattern(s) to use to define the group.`);

export const InventoryHostSchema = Joi.object({ ...InventoryEntrySchemaObject }).meta(
  joiMetaClassName('InventoryHostInterface'),
);

export const InventoryGroupSchema = Joi.object({
  pattern: InventoryGroupStringEntriesSchema,
  ...InventoryEntrySchemaObject,
}).meta({ className: 'InventoryGroupInterface' }).description(`
  A full group configuration, defined through a pattern.
  `);

export const InventoryGroupSpecialSchema = Joi.object({ ...InventoryEntrySchemaObject }).meta({
  className: 'InventoryGroupSpecialInterface',
}).description(`
  This schema is for "special" groups, where hosts are not defined explicitly.
  
  All available special groups are:
  ${specialGroupNames.map((g) => `- \`${g}\`: ${specialGroupsDescriptions[g]}`).join('\n')}
`);

export const InventorySchema = Joi.object({
  hostSources: Joi.array().items(InventoryHostSourceSchema).description(`
  A list of host sources to load hosts definitions from.
  `),
  groups: joiObjectWithPattern(
    Joi.alternatives([
      InventoryGroupStringEntriesSchema.description(`Define the group via simple patterns.`),
      InventoryGroupSchema.description(`Define the group with patterns and properties.`),
      InventoryGroupSpecialSchema.description(`Specify properties for special groups.`),
    ]),
  ).description(`
  The definition of all available groups and which hosts belong to them.
  `),
  ...VarsContainerSchemaObject,
}).meta({ className: 'InventoryInterface' });
