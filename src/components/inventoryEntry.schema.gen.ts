/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

import type { VarsInterface, VarsSourcesInterface } from './varsContainer.schema.gen';

// [block InventoryEntryInterface begin]
export interface InventoryEntryInterface {
  /**
   * Defines which other hosts/groups shall be included in the compiled inventory
   */
  relations?: InventoryEntryRelationsInterface; //typeRef:InventoryEntryRelationsInterface:{"relPath":"self","isRegistryExport":false}

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
// [block InventoryEntryInterface end]
//meta:InventoryEntryInterface:[{"className":"InventoryEntryInterface"}]

// [block InventoryEntryRelationsInterface begin]
export type InventoryEntryRelationsInterface = string[];
// [block InventoryEntryRelationsInterface end]
//meta:InventoryEntryRelationsInterface:[{"className":"InventoryEntryRelationsInterface"}]
