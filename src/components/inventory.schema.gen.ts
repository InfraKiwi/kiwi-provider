// Generated with: yarn gen -> cmd/schemaGen.ts

import type { InventoryEntryRelationsInterface } from './inventoryEntry.schema.gen';
import type { VarsInterface, VarsSourcesInterface } from './varsContainer.schema.gen';

// [block InventoryGroupInterface begin]
/**
 * A full group configuration, defined through a pattern.
 */
export interface InventoryGroupInterface {
  /**
   * The pattern(s) to use to define the group.
   */
  pattern?: InventoryGroupStringEntriesInterface; //typeRef:InventoryGroupStringEntriesInterface:inventory.schema.gen.ts:false

  /**
   * Defines which other hosts/groups shall be included in the compiled inventory
   */
  relations?: InventoryEntryRelationsInterface; //typeRef:InventoryEntryRelationsInterface:inventoryEntry.schema.gen.ts:false

  /**
   * Defines a key that, if found in the entry vars, will also be used to populate
   * the `relations` array.
   */
  varsKeyRelations?:
    | '__relations'
    | string;

  /**
   * Hardcoded variables for this entry
   */
  vars?: VarsInterface; //typeRef:VarsInterface:varsContainer.schema.gen.ts:false

  /**
   * Compile-time vars sources for the entry
   */
  varsSources?: VarsSourcesInterface; //typeRef:VarsSourcesInterface:varsContainer.schema.gen.ts:false

}
// [block InventoryGroupInterface end]

// [block InventoryGroupSpecialInterface begin]
/**
 * This schema is for "special" groups, where hosts are not defined explicitly.
 *
 * All available special groups are:
 * - `all`: All hosts.
 * - `grouped`: Hosts that belong to a group.
 * - `ungrouped`: Hosts that do not belong to any group.
 */
export interface InventoryGroupSpecialInterface {
  /**
   * Defines which other hosts/groups shall be included in the compiled inventory
   */
  relations?: InventoryEntryRelationsInterface; //typeRef:InventoryEntryRelationsInterface:inventoryEntry.schema.gen.ts:false

  /**
   * Defines a key that, if found in the entry vars, will also be used to populate
   * the `relations` array.
   */
  varsKeyRelations?:
    | '__relations'
    | string;

  /**
   * Hardcoded variables for this entry
   */
  vars?: VarsInterface; //typeRef:VarsInterface:varsContainer.schema.gen.ts:false

  /**
   * Compile-time vars sources for the entry
   */
  varsSources?: VarsSourcesInterface; //typeRef:VarsSourcesInterface:varsContainer.schema.gen.ts:false

}
// [block InventoryGroupSpecialInterface end]

// [block InventoryGroupStringEntriesInterface begin]
/**
 * The pattern(s) to use to define the group.
 */
export type InventoryGroupStringEntriesInterface =

  /**
   * A single pattern.
   *
   * @example
   * groups:
   *   myGroup: loadbalancer-az*.hello.com
   */
  | string

  /**
   * An array of patterns.
   *
   * @example
   * groups:
   *   myGroup:
   *     - loadbalancer-az*.hello.com
   *     - loadbalancer-global*.hello.com
   */
  | string[];
// [block InventoryGroupStringEntriesInterface end]

// [block InventoryHostInterface begin]
export interface InventoryHostInterface {
  /**
   * Defines which other hosts/groups shall be included in the compiled inventory
   */
  relations?: InventoryEntryRelationsInterface; //typeRef:InventoryEntryRelationsInterface:inventoryEntry.schema.gen.ts:false

  /**
   * Defines a key that, if found in the entry vars, will also be used to populate
   * the `relations` array.
   */
  varsKeyRelations?:
    | '__relations'
    | string;

  /**
   * Hardcoded variables for this entry
   */
  vars?: VarsInterface; //typeRef:VarsInterface:varsContainer.schema.gen.ts:false

  /**
   * Compile-time vars sources for the entry
   */
  varsSources?: VarsSourcesInterface; //typeRef:VarsSourcesInterface:varsContainer.schema.gen.ts:false

}
// [block InventoryHostInterface end]

// [block InventoryHostSourceInterface begin]
export interface InventoryHostSourceInterface {
  /**
   * Unknown Property
   */
  [x: string]: unknown;
}
// [block InventoryHostSourceInterface end]

// [block InventoryInterface begin]
export interface InventoryInterface {
  /**
   * A list of host sources to load hosts definitions from.
   */
  hostSources?: InventoryHostSourceInterface[]; //typeRef:InventoryHostSourceInterface:inventory.schema.gen.ts:false

  /**
   * The definition of all available groups and which hosts belong to them.
   */
  groups?: {
    [x: string]:

      /**
       * Define the group via simple patterns.
       */
      | InventoryGroupStringEntriesInterface //typeRef:InventoryGroupStringEntriesInterface:inventory.schema.gen.ts:false

      /**
       * Define the group with patterns and properties.
       */
      | InventoryGroupInterface //typeRef:InventoryGroupInterface:inventory.schema.gen.ts:false

      /**
       * Specify properties for special groups.
       */
      | InventoryGroupSpecialInterface; //typeRef:InventoryGroupSpecialInterface:inventory.schema.gen.ts:false

  };

  /**
   * Hardcoded variables for this entry
   */
  vars?: VarsInterface; //typeRef:VarsInterface:varsContainer.schema.gen.ts:false

  /**
   * Compile-time vars sources for the entry
   */
  varsSources?: VarsSourcesInterface; //typeRef:VarsSourcesInterface:varsContainer.schema.gen.ts:false

}
// [block InventoryInterface end]
