/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

import type { VarsInterface } from '../components/varsContainer.schema.gen';

// [block ModuleRunResultInterface begin]
export interface ModuleRunResultInterface {
  /**
   * When a module sets the `failed` variable to `true`, the execution of
   * the task is marked as failed and, if there are no other "failure catching"
   * methods in place, the recipe's execution will be halted.
   */
  failed?: string;

  /**
   * When a module sets the `exit` variable to `true`, the execution of
   * the recipe will be halted without raising an error.
   */
  exit?: boolean;

  /**
   * When a module sets any key/pair into the `vars` object, these variables
   * will be accessible, depending on the task configuration, in the outer
   * context.
   */
  vars?: VarsInterface; //typeRef:VarsInterface:{"relPath":"../components/varsContainer.schema.gen.ts","isRegistryExport":false}

  /**
   * When a module sets the `changed` variable to `true`, the task is
   * categorized as one that changed the underlying system.
   */
  changed?: boolean;
}
// [block ModuleRunResultInterface end]
//meta:ModuleRunResultInterface:[{"className":"ModuleRunResultInterface"}]
