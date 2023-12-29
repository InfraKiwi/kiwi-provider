/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

import type { TaskInterface } from '../../components/task.schema.gen';

// [block ModuleLoopInterface begin]
export interface ModuleLoopInterface {
  /**
   * The items to iterate over.
   */
  items:

    /**
     * An array to iterate over.
     */
    | any[]

    /**
     * An object to iterate over.
     */
    | object;

  /**
   * The name of the variable that will be injected in the context for
   * every loop iteration.
   *
   * If `items` is an object, the loop variable will contain the following entries:
   * - `key`: the current key of the object.
   * - `item`: the corresponding value.
   *
   * If `items` is an array, the loop variable will contain the following entries:
   * - `key`: the current index of the array (number).
   * - `item`: the corresponding value.
   */
  var?:
    | '__loop'
    | string;
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
// [block ModuleLoopInterface end]
//meta:ModuleLoopInterface:[{"className":"ModuleLoopInterface","entryNames":["loop"]}]

export type ModuleLoopInterfaceConfigKey = 'loop';
export const ModuleLoopInterfaceConfigKeyFirst = 'loop';
