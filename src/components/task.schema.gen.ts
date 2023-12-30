/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

import type { ModuleRunResultInterface } from '../modules/abstractModuleBase.schema.gen';

import type { VarsInterface } from './varsContainer.schema.gen';
import type { ConditionSetInterface } from './testingCommon.schema.gen';

// [block ExitIfFullInterface begin]
export interface ExitIfFullInterface {
  message?: string;
  if: string;
}
// [block ExitIfFullInterface end]
//meta:ExitIfFullInterface:[{"className":"ModuleExitFullInterface"},{"className":"ExitIfFullInterface"}]

// [block FailedIfFullInterface begin]
export interface FailedIfFullInterface {
  message?: string;
  if: string;
}
// [block FailedIfFullInterface end]
//meta:FailedIfFullInterface:[{"className":"ModuleFailFullInterface"},{"className":"FailedIfFullInterface"}]

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
  vars?: VarsInterface; //typeRef:VarsInterface:{"relPath":"varsContainer.schema.gen.ts","isRegistryExport":false}

  /**
   * If provided, registers any output variables into a variable with the name
   * provided as value of the `out` argument.
   */
  out?: string;

  /**
   * If provided, registers the full module result into a variable with the name
   * provided as value of the `outRaw` argument.
   */
  outRaw?: string;

  /**
   * When provided, the task will fail if this condition succeeds.
   * Expects a template that would work inside an `if` condition.
   *
   * The context available for this condition is the same one available at
   * the module's resolution time, plus the additional field `__result`,
   * which contains the result of the module.
   *
   * The `__result` field is of type ModuleRunResultInterface. ##typeRef:ModuleRunResultInterface:{"relPath":"../modules/abstractModuleBase.schema.gen.ts"}
   */
  failedIf?:
    | string
    | FailedIfFullInterface //typeRef:FailedIfFullInterface:{"relPath":"self","isRegistryExport":false}
    | boolean;

  /**
   * When provided, the recipe will stop successfully if this condition succeeds.
   * Expects a template that would work inside an `if` condition.
   *
   * The context available for this condition is the same one available at
   * the module's resolution time, plus the additional field `__result`,
   * which contains the result of the module.
   *
   * The `__result` field is of type ModuleRunResultInterface. ##typeRef:ModuleRunResultInterface:{"relPath":"../modules/abstractModuleBase.schema.gen.ts"}
   */
  exitIf?:
    | string
    | ExitIfFullInterface //typeRef:ExitIfFullInterface:{"relPath":"self","isRegistryExport":false}
    | boolean;

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
  testMocks?: TaskTestMockInterface[]; //typeRef:TaskTestMockInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * The module to use in the task.
   * You can check the available task modules here: ##link#See all available task modules#/modules
   */
  [x: string]: any;
}
// [block TaskInterface end]
//meta:TaskInterface:[{"className":"TaskInterface","unknownType":{"type":"any","flags":{"description":"\n    The module to use in the task.\n    You can check the available task modules here: ##link#See all available task modules#/modules\n    "}}}]

// [block TaskTestMockInterface begin]
export interface TaskTestMockInterface {
  result: ModuleRunResultInterface; //typeRef:ModuleRunResultInterface:{"relPath":"../modules/abstractModuleBase.schema.gen.ts","isRegistryExport":false}

  if?: ConditionSetInterface; //typeRef:ConditionSetInterface:{"relPath":"testingCommon.schema.gen.ts","isRegistryExport":false}
}
// [block TaskTestMockInterface end]
//meta:TaskTestMockInterface:[{"className":"TestMockBaseInterface"},{"className":"TaskTestMockInterface"}]
