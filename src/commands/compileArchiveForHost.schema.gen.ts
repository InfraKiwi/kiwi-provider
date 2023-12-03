import type { Archive } from '../components/archive';
import type { Inventory } from '../components/inventory';
import type { InventoryInterface } from '../components/inventory.schema.gen';
import type { ArchiveInterface } from '../components/archive.schema.gen';
// Generated with: yarn gen -> cmd/schemaGen.ts

// [block CompileArchiveForHostArgsInterface begin]
export interface CompileArchiveForHostArgsInterface {
  hostname: string;
  inventory: Inventory;
  archive: Archive;
  implicitHosts?: string[];
}
// [block CompileArchiveForHostArgsInterface end]

// [block CompileArchiveForHostResultInterface begin]
export interface CompileArchiveForHostResultInterface {
  inventory: InventoryInterface; //typeRef:InventoryInterface:../components/inventory.schema.gen.ts:false

  archive: ArchiveInterface; //typeRef:ArchiveInterface:../components/archive.schema.gen.ts:false

  stats?: object;
}
// [block CompileArchiveForHostResultInterface end]
