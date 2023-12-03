// Generated with: yarn gen -> cmd/schemaGen.ts

import type { RunnerDockerInterface } from './docker/schema.gen';
import type { RunnerLocalInterface } from './local/schema.gen';

// [block registryEntriesRunnersInterface begin]
export interface registryEntriesRunnersInterface {

  /*
   *
   * ========= Available modules =========
   *
   * Only one of the following keys can be
   * used at the same time.
   *
   */

  docker?: RunnerDockerInterface; //typeRef:RunnerDockerInterface:docker/schema.gen.ts:true

  local?: RunnerLocalInterface; //typeRef:RunnerLocalInterface:local/schema.gen.ts:true

}
// [block registryEntriesRunnersInterface end]
