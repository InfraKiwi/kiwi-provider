import type { InventoryHost } from '../components/inventoryHost.ts';
import type { Logger } from 'winston';
import type { VarsInterface } from '../components/varsContainer.schema.gen';
// Generated with: yarn gen -> cmd/schemaGen.ts

// [block RunContextPublicVarsInterface begin]
export interface RunContextPublicVarsInterface {
  /**
   * The logger provided by the context
   */
  logger: Logger;

  /**
   * The current host
   */
  host: InventoryHost;

  /**
   * Contains the vars shared by all modules
   */
  vars: VarsInterface; //typeRef:VarsInterface:../components/varsContainer.schema.gen.ts:false

  /**
   * When tasks are executed, this will always contain the previous task's
   * result, unless the previous task is configured with
   * `keepPreviousTaskResult: true`, in which case the previous task's result
   * will be ignored.
   */
  previousTaskResult?: VarsInterface; //typeRef:VarsInterface:../components/varsContainer.schema.gen.ts:false

  /**
   * The current working directory, used by default by any modules that
   * operate on the file-system.
   */
  workDir?: string;

  /**
   * True only when the recipe is being executes through a test suite.
   */
  isTesting: boolean;
}
// [block RunContextPublicVarsInterface end]
