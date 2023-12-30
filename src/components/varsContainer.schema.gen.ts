/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

import type { VarsSourceInterface } from './varsSource.schema.gen';

// [block VarsContainerInterface begin]
export interface VarsContainerInterface {
  /**
   * Hardcoded variables for this entry
   */
  vars?: VarsInterface; //typeRef:VarsInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * Compile-time vars sources for the entry
   */
  varsSources?: VarsSourcesInterface; //typeRef:VarsSourcesInterface:{"relPath":"self","isRegistryExport":false}
}
// [block VarsContainerInterface end]
//meta:VarsContainerInterface:[{"className":"VarsContainerInterface"}]

// [block VarsInterface begin]
export interface VarsInterface {
  /**
   * A variable key must be of string type, while its value can be of any kind.
   */
  [x: string]: any;
}
// [block VarsInterface end]
//meta:VarsInterface:[{"className":"VarsInterface","unknownType":{"type":"any","flags":{"description":"\nA variable key must be of string type, while its value can be of any kind.\n"}}}]

// [block VarsSourcesInterface begin]
/**
 * An array of vars sources.
 */
export type VarsSourcesInterface = VarsSourceInterface[]; //typeRef:VarsSourceInterface:{"relPath":"varsSource.schema.gen.ts","isRegistryExport":false}

// [block VarsSourcesInterface end]
//meta:VarsSourcesInterface:[{"className":"VarsSourcesInterface"}]
