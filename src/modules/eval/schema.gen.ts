/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts


import type { RunContextPublicVarsInterface } from '../../util/runContext.schema.gen';
import type { VarsInterface } from '../../components/varsContainer.schema.gen';

// [block EvalContextFileInterface begin]
export interface EvalContextFileInterface {
  /**
   * The context available in every task module's execution.
   */
  context: RunContextPublicVarsInterface; //typeRef:RunContextPublicVarsInterface:{"relPath":"../../util/runContext.schema.gen.ts","isRegistryExport":false}

  /**
   * The result of the `eval` module.
   */
  result: {
    /**
     * Any variables to propagate to the outer scope.
     */
    vars: VarsInterface; //typeRef:VarsInterface:{"relPath":"../../components/varsContainer.schema.gen.ts","isRegistryExport":false}
  };

  /**
   * The path of the file being executed by the `eval` module.
   */
  __filename: string;
}
// [block EvalContextFileInterface end]
//meta:EvalContextFileInterface:[{"className":"EvalContextInterface"},{"className":"EvalContextFileInterface"}]

// [block EvalContextInterface begin]
export interface EvalContextInterface {
  /**
   * The context available in every task module's execution.
   */
  context: RunContextPublicVarsInterface; //typeRef:RunContextPublicVarsInterface:{"relPath":"../../util/runContext.schema.gen.ts","isRegistryExport":false}

  /**
   * The result of the `eval` module.
   */
  result: {
    /**
     * Any variables to propagate to the outer scope.
     */
    vars: VarsInterface; //typeRef:VarsInterface:{"relPath":"../../components/varsContainer.schema.gen.ts","isRegistryExport":false}
  };
}
// [block EvalContextInterface end]
//meta:EvalContextInterface:[{"className":"EvalContextInterface"}]

// [block EvalFunctionInterface begin]
export type EvalFunctionInterface = ((context: EvalContextInterface) => void | Promise<void>); //typeRef:EvalContextInterface:{"relPath":"self","isRegistryExport":false}

// [block EvalFunctionInterface end]
//meta:EvalFunctionInterface:[{"baseType":"((context: EvalContextInterface) => void | Promise<void>)"},{"className":"EvalFunctionInterface"}]

// [block ModuleEvalInterface begin]
/**
 * Evaluates JS code. Only one of `code` and `file` can be specified at the same time.
 */
export interface ModuleEvalInterface {
  code?:

    /**
     * Some plain JS code.
     */
    | string

    /**
     * A JS function. This feature is only available when the recipe is a JS/TS file.
     */
    | EvalFunctionInterface; //typeRef:EvalFunctionInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * The path to a JS file to execute.
   */
  file?: string;
}
// [block ModuleEvalInterface end]
//meta:ModuleEvalInterface:[{"className":"ModuleEvalInterface","entryNames":["eval"]}]

export type ModuleEvalInterfaceConfigKey = 'eval';
export const ModuleEvalInterfaceConfigKeyFirst = 'eval';
