// Generated with: yarn gen -> cmd/schemaGen.ts

import type { VarsInterface, VarsSourcesInterface } from './varsContainer.schema.gen';

// [block InventoryEntryInterface begin]
export interface InventoryEntryInterface {
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
// [block InventoryEntryInterface end]

// [block InventoryEntryRelationsInterface begin]
export type InventoryEntryRelationsInterface = string[];
// [block InventoryEntryRelationsInterface end]
