/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

import type { TaskInterface } from '../../components/task.schema.gen';

// [block ModuleSwitchCaseFullInterface begin]
export interface ModuleSwitchCaseFullInterface {
  /**
   * If the `if` condition is undefined, this case will always be executed.
   */
  if?: string;

  /**
   * If true, the evaluation will proceed also to the next case.
   */
  fallthrough?: boolean;

  /**
   * The task configuration
   */
  task:

    /**
     * The task to be executed.
     */
    | TaskInterface //link#See the definition of `TaskInterface`#/core/recipes#taskinterface

    /**
     * An array of tasks to be executed.
     */
    | TaskInterface[]; //link#See the definition of `TaskInterface`#/core/recipes#taskinterface
}
// [block ModuleSwitchCaseFullInterface end]
//meta:ModuleSwitchCaseFullInterface:[{"className":"ModuleSwitchCaseFullInterface"}]

// [block ModuleSwitchInterface begin]
export interface ModuleSwitchInterface {
  /**
   * The value to evaluate.
   */
  value?: any;

  /**
   * The definition of all cases to evaluate.
   */
  cases:

    /**
     * An object, where each key represents a case match and the value the task config.
     */
    | ({
    /**
     * The task configuration
     */
    [x: string]:

      /**
       * The task to be executed.
       */
      | TaskInterface //link#See the definition of `TaskInterface`#/core/recipes#taskinterface

      /**
       * An array of tasks to be executed.
       */
      | TaskInterface[]; //link#See the definition of `TaskInterface`#/core/recipes#taskinterface
  })

    /**
     * An array of conditions to evaluate.
     */
  | ModuleSwitchCaseFullInterface[]; //typeRef:ModuleSwitchCaseFullInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * The default case, which is executed if no other cases match successfully.
   */
  default?:

    /**
     * The task to be executed.
     */
    | TaskInterface //link#See the definition of `TaskInterface`#/core/recipes#taskinterface

    /**
     * An array of tasks to be executed.
     */
    | TaskInterface[]; //link#See the definition of `TaskInterface`#/core/recipes#taskinterface
}
// [block ModuleSwitchInterface end]
//meta:ModuleSwitchInterface:[{"className":"ModuleSwitchInterface","entryNames":["switch"]}]

export type ModuleSwitchInterfaceConfigKey = 'switch';
export const ModuleSwitchInterfaceConfigKeyFirst = 'switch';
