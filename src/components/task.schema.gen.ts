import type { ModuleRunResultInterface } from '../modules/abstractModuleBase.schema.gen';
// Generated with: yarn gen -> cmd/schemaGen.ts

import type { VarsInterface } from './varsContainer.schema.gen';
import type { ConditionSetInterface } from './testingCommon.schema.gen';

// [block ExitIfFullInterface begin]
export interface ExitIfFullInterface {
  message?: string;
  if: string;
}
// [block ExitIfFullInterface end]

// [block FailedIfFullInterface begin]
export interface FailedIfFullInterface {
  message?: string;
  if: string;
}
// [block FailedIfFullInterface end]

// [block TaskInterface begin]
/**
 * Defines a task to be executed.
 */
export interface TaskInterface {
  /**
   * A friendly identifier for the task, which will be printed in logs.
   */
  label?: string;

  /**
   * When provided, the task will be executed only if this condition succeeds.
   * Expects a template that would work inside an `if` condition.
   */
  if?: string;

  /**
   * Any vars you want to provide to the task.
   */
  vars?: VarsInterface; //typeRef:VarsInterface:varsContainer.schema.gen.ts:false

  /**
   * If provided, registers any output variables into the variable name
   * provided as value of the `out` argument.
   */
  out?: string;

  /**
   * When provided, the task will fail if this condition succeeds.
   * Expects a template that would work inside an `if` condition.
   */
  failedIf?:
    | string
    | FailedIfFullInterface; //typeRef:FailedIfFullInterface:task.schema.gen.ts:false

  /**
   * When provided, the recipe will stop successfully if this condition succeeds.
   * Expects a template that would work inside an `if` condition.
   */
  exitIf?:
    | string
    | ExitIfFullInterface; //typeRef:ExitIfFullInterface:task.schema.gen.ts:false

  /**
   * If true, registers any output variables into the global context.
   */
  global?: boolean;

  /**
   * If true, all registered variables will be treated as secrets
   * E.g. useful for logging purposes.
   */
  sensitive?: boolean;

  /**
   * Really only meant for debugging purposes, preserves the result of the
   * previous task and does not overwrite it. E.g. useful while using the debug
   * module.
   */
  keepPreviousTaskResult?: boolean;

  /**
   * Enabled only in testing mode.
   */
  testMocks?: TaskTestMockInterface[]; //typeRef:TaskTestMockInterface:task.schema.gen.ts:false

  /**
   * The module to use in the task.
   */
  [x: string]: any;
}
// [block TaskInterface end]

// [block TaskTestMockInterface begin]
export interface TaskTestMockInterface {
  result: ModuleRunResultInterface; //typeRef:ModuleRunResultInterface:../modules/abstractModuleBase.schema.gen.ts:false

  if?: ConditionSetInterface; //typeRef:ConditionSetInterface:testingCommon.schema.gen.ts:false

}
// [block TaskTestMockInterface end]
