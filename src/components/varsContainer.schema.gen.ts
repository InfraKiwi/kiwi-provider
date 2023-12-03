// Generated with: yarn gen -> cmd/schemaGen.ts

import type { VarsSourceInterface } from './varsSource.schema.gen';

// [block VarsContainerInterface begin]
export interface VarsContainerInterface {
  /**
   * Hardcoded variables for this entry
   */
  vars?: VarsInterface; //typeRef:VarsInterface:varsContainer.schema.gen.ts:false

  /**
   * Compile-time vars sources for the entry
   */
  varsSources?: VarsSourcesInterface; //typeRef:VarsSourcesInterface:varsContainer.schema.gen.ts:false

}
// [block VarsContainerInterface end]

// [block VarsInterface begin]
export interface VarsInterface {
  /**
   * A variable key must be of string type, while its value can be of any kind.
   */
  [x: string]: any;
}
// [block VarsInterface end]

// [block VarsSourcesInterface begin]
/**
 * An array of vars sources.
 */
export type VarsSourcesInterface = VarsSourceInterface[]; //typeRef:VarsSourceInterface:varsSource.schema.gen.ts:false

// [block VarsSourcesInterface end]
