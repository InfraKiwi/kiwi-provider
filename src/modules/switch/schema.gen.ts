import type { TaskInterface } from '../../components/task.schema.gen';
// Generated with: yarn gen -> cmd/schemaGen.ts

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
  task: /**
   * The task to be executed.
   */
    | TaskInterface //typeRef:TaskInterface:../../components/task.schema.gen.ts:false

    /**
     * An array of tasks to be executed.
     */
    | TaskInterface[]; //typeRef:TaskInterface:../../components/task.schema.gen.ts:false
}
// [block ModuleSwitchCaseFullInterface end]

// [block ModuleSwitchInterface begin]
export interface ModuleSwitchInterface {
  /**
   * The value to evaluate.
   */
  value?: any;

  /**
   * The definition of all cases to evaluate.
   */
  cases: /**
   * An object, where each key represents a case match and the value the task config.
   */
    | {
    /**
     * The task configuration
     */
      [x: string]: /**
         * The task to be executed.
         */
        | TaskInterface //typeRef:TaskInterface:../../components/task.schema.gen.ts:false

          /**
           * An array of tasks to be executed.
           */
        | TaskInterface[]; //typeRef:TaskInterface:../../components/task.schema.gen.ts:false
    }

    /**
     * An array of conditions to evaluate.
     */
    | ModuleSwitchCaseFullInterface[]; //typeRef:ModuleSwitchCaseFullInterface:schema.gen.ts:false

  /**
   * The default case, which is executed if no other cases match successfully.
   */
  default?: /**
   * The task to be executed.
   */
    | TaskInterface //typeRef:TaskInterface:../../components/task.schema.gen.ts:false

    /**
     * An array of tasks to be executed.
     */
    | TaskInterface[]; //typeRef:TaskInterface:../../components/task.schema.gen.ts:false
}
// [block ModuleSwitchInterface end]

export type ModuleSwitchInterfaceConfigKey = 'switch';
export const ModuleSwitchInterfaceConfigKeyFirst = 'switch';
