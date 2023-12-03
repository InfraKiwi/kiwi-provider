import type { TaskInterface } from '../../components/task.schema.gen';
// Generated with: yarn gen -> cmd/schemaGen.ts

// [block ModuleLoopInterface begin]
export interface ModuleLoopInterface {
  /**
   * The items to iterate over.
   */
  items: /**
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
  var?: '__loop' | string;
  task: /**
   * The task to be executed.
   */
    | TaskInterface //typeRef:TaskInterface:../../components/task.schema.gen.ts:false

    /**
     * An array of tasks to be executed.
     */
    | TaskInterface[]; //typeRef:TaskInterface:../../components/task.schema.gen.ts:false
}
// [block ModuleLoopInterface end]

export type ModuleLoopInterfaceConfigKey = 'loop';
export const ModuleLoopInterfaceConfigKeyFirst = 'loop';
