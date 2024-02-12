/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

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
  pattern?: InventoryGroupStringEntriesInterface; //typeRef:InventoryGroupStringEntriesInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * Defines which other hosts/groups shall be included in the compiled inventory
   */
  relations?: InventoryEntryRelationsInterface; //typeRef:InventoryEntryRelationsInterface:{"relPath":"inventoryEntry.schema.gen.ts","isRegistryExport":false}

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
  vars?: VarsInterface; //typeRef:VarsInterface:{"relPath":"varsContainer.schema.gen.ts","isRegistryExport":false}

  /**
   * Compile-time vars sources for the entry
   */
  varsSources?: VarsSourcesInterface; //typeRef:VarsSourcesInterface:{"relPath":"varsContainer.schema.gen.ts","isRegistryExport":false}
}
// [block InventoryGroupInterface end]
//meta:InventoryGroupInterface:[{"className":"InventoryGroupInterface"}]

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
  relations?: InventoryEntryRelationsInterface; //typeRef:InventoryEntryRelationsInterface:{"relPath":"inventoryEntry.schema.gen.ts","isRegistryExport":false}

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
  vars?: VarsInterface; //typeRef:VarsInterface:{"relPath":"varsContainer.schema.gen.ts","isRegistryExport":false}

  /**
   * Compile-time vars sources for the entry
   */
  varsSources?: VarsSourcesInterface; //typeRef:VarsSourcesInterface:{"relPath":"varsContainer.schema.gen.ts","isRegistryExport":false}
}
// [block InventoryGroupSpecialInterface end]
//meta:InventoryGroupSpecialInterface:[{"className":"InventoryGroupSpecialInterface"}]

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
//meta:InventoryGroupStringEntriesInterface:[{"className":"InventoryGroupStringEntriesInterface"}]

// [block InventoryHostInterface begin]
export interface InventoryHostInterface {
  /**
   * Defines which other hosts/groups shall be included in the compiled inventory
   */
  relations?: InventoryEntryRelationsInterface; //typeRef:InventoryEntryRelationsInterface:{"relPath":"inventoryEntry.schema.gen.ts","isRegistryExport":false}

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
  vars?: VarsInterface; //typeRef:VarsInterface:{"relPath":"varsContainer.schema.gen.ts","isRegistryExport":false}

  /**
   * Compile-time vars sources for the entry
   */
  varsSources?: VarsSourcesInterface; //typeRef:VarsSourcesInterface:{"relPath":"varsContainer.schema.gen.ts","isRegistryExport":false}
}
// [block InventoryHostInterface end]
//meta:InventoryHostInterface:[{"className":"InventoryHostInterface"}]

// [block InventoryHostSourceInterface begin]
export interface InventoryHostSourceInterface {
  /**
   * The host source config.
   * You can check the available host sources here: ##link#See all available host sources#/hostSources
   */
  [x: string]: any;
}
// [block InventoryHostSourceInterface end]
//meta:InventoryHostSourceInterface:[{"className":"InventoryHostSourceInterface","unknownType":{"type":"any","flags":{"description":"\n    The host source config.\n    You can check the available host sources here: ##link#See all available host sources#/hostSources\n    "}}}]

// [block InventoryInterface begin]
export interface InventoryInterface {
  /**
   * A raw map of hosts (hostname -> host data).
   *
   * @example
   * hosts:
   *   my-host:
   *     vars:
   *       ip: 192.168.1.2
   */
  hosts?: {
    [x: string]: InventoryHostInterface; //typeRef:InventoryHostInterface:{"relPath":"self","isRegistryExport":false}
  };

  /**
   * A list of host sources to load hosts definitions from.
   */
  hostSources?: InventoryHostSourceInterface[]; //typeRef:InventoryHostSourceInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * The definition of all available groups and which hosts belong to them.
   */
  groups?: {
    [x: string]:

      /**
       * Define the group via simple patterns.
       */
      | InventoryGroupStringEntriesInterface //typeRef:InventoryGroupStringEntriesInterface:{"relPath":"self","isRegistryExport":false}

      /**
       * Define the group with patterns and properties.
       */
      | InventoryGroupInterface //typeRef:InventoryGroupInterface:{"relPath":"self","isRegistryExport":false}

      /**
       * Specify properties for special groups.
       */
      | InventoryGroupSpecialInterface; //typeRef:InventoryGroupSpecialInterface:{"relPath":"self","isRegistryExport":false}
  };

  /**
   * Hardcoded variables for this entry
   */
  vars?: VarsInterface; //typeRef:VarsInterface:{"relPath":"varsContainer.schema.gen.ts","isRegistryExport":false}

  /**
   * Compile-time vars sources for the entry
   */
  varsSources?: VarsSourcesInterface; //typeRef:VarsSourcesInterface:{"relPath":"varsContainer.schema.gen.ts","isRegistryExport":false}
}
// [block InventoryInterface end]
//meta:InventoryInterface:[{"className":"InventoryInterface"}]
