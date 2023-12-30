/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

import type { Inventory } from '../components/inventory';
import type { Archive } from '../components/archive';

import type { InventoryInterface } from '../components/inventory.schema.gen';
import type { ArchiveInterface } from '../components/archive.schema.gen';

// [block CompileArchiveForHostArgsInterface begin]
export interface CompileArchiveForHostArgsInterface {
  hostname: string;
  inventory: Inventory;
  archive: Archive;
  implicitHosts?: string[];
}
// [block CompileArchiveForHostArgsInterface end]
//meta:CompileArchiveForHostArgsInterface:[{"className":"CompileArchiveForHostArgsInterface"}]

// [block CompileArchiveForHostResultInterface begin]
export interface CompileArchiveForHostResultInterface {
  inventory: InventoryInterface; //typeRef:InventoryInterface:{"relPath":"../components/inventory.schema.gen.ts","isRegistryExport":false}

  archive: ArchiveInterface; //typeRef:ArchiveInterface:{"relPath":"../components/archive.schema.gen.ts","isRegistryExport":false}

  stats?: object;
}
// [block CompileArchiveForHostResultInterface end]
//meta:CompileArchiveForHostResultInterface:[{"className":"CompileArchiveForHostResultInterface"}]
