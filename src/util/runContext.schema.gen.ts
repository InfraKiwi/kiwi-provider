/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/ci/ciSchemaGen.ts

import type { Logger } from 'winston';
import type { InventoryHost } from '../components/inventoryHost.ts';

import type { VarsInterface } from '../components/varsContainer.schema.gen';

// [block RunContextPublicVarsInterface begin]
/**
 * The context available in every task module's execution.
 */
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
  vars: VarsInterface; //typeRef:VarsInterface:{"relPath":"../components/varsContainer.schema.gen.ts","isRegistryExport":false}

  /**
   * When tasks are executed, this will always contain the previous task's
   * result, unless the previous task is configured with
   * `keepPreviousTaskResult: true`, in which case the previous task's result
   * will be ignored.
   */
  previousTaskResult?: VarsInterface; //typeRef:VarsInterface:{"relPath":"../components/varsContainer.schema.gen.ts","isRegistryExport":false}

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
//meta:RunContextPublicVarsInterface:[{"className":"RunContextPublicVarsInterface"}]
