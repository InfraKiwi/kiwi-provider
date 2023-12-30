/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

import type { RecipeSourceListInterface } from '../recipeSources/recipeSourceList.schema.gen';
import type { ModuleRunResultInterface } from '../modules/abstractModuleBase.schema.gen';

import type { VarsInterface, VarsSourcesInterface } from './varsContainer.schema.gen';
import type { TaskInterface } from './task.schema.gen';

// [block HostVarsBlockInterface begin]
export interface HostVarsBlockInterface {
  hostVars?: {
    [x: string]: VarsInterface; //typeRef:VarsInterface:{"relPath":"varsContainer.schema.gen.ts","isRegistryExport":false}
  };
  groupVars?: {
    [x: string]: VarsInterface; //typeRef:VarsInterface:{"relPath":"varsContainer.schema.gen.ts","isRegistryExport":false}
  };
}
// [block HostVarsBlockInterface end]
//meta:HostVarsBlockInterface:[{"className":"HostVarsBlockInterface"}]

// [block RecipeDependencyInterface begin]
export interface RecipeDependencyInterface {
  version?: string;
  sourceId?: string;
}
// [block RecipeDependencyInterface end]
//meta:RecipeDependencyInterface:[{"className":"RecipeDependencyInterface"}]

// [block RecipeDependencyWithAlternativesInterface begin]
export type RecipeDependencyWithAlternativesInterface =
  | (
    | string
    | null)
    | RecipeDependencyInterface; //typeRef:RecipeDependencyInterface:{"relPath":"self","isRegistryExport":false}

// [block RecipeDependencyWithAlternativesInterface end]
//meta:RecipeDependencyWithAlternativesInterface:[{"className":"RecipeDependencyWithAlternativesInterface"}]

// [block RecipeForArchiveInterface begin]
export interface RecipeForArchiveInterface {
  config: RecipeMinimalInterface; //typeRef:RecipeMinimalInterface:{"relPath":"self","isRegistryExport":false}

  targets?: RecipeTargetsInterface; //typeRef:RecipeTargetsInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * Which phase this recipe belongs to.
   *
   * @default runtime
   */
  phase?:

    /**
     * Recipes are run in the boostrap phase when the agent is being installed
     * on the machine for the first time.
     */
    | 'bootstrap'

    /**
     * Recipes are normally run in the runtime phase.
     */
    | 'runtime';
  otherHosts?: RecipeTargetsInterface; //typeRef:RecipeTargetsInterface:{"relPath":"self","isRegistryExport":false}
}
// [block RecipeForArchiveInterface end]
//meta:RecipeForArchiveInterface:[{"className":"RecipeForArchiveInterface"}]

// [block RecipeInputsInterface begin]
export interface RecipeInputsInterface {
  [x: string]:

    /**
     * A string that represents a raw type, e.g. string, number, etc.
     * If ending with `?`, mark the input as optional.
     */
    | (
      | 'alternatives'
      | 'alternatives?'
      | 'any'
      | 'any?'
      | 'array'
      | 'array?'
      | 'boolean'
      | 'boolean?'
      | 'date'
      | 'date?'
      | 'function'
      | 'function?'
      | 'link'
      | 'link?'
      | 'number'
      | 'number?'
      | 'object'
      | 'object?'
      | 'string'
      | 'string?'
      | 'symbol'
      | 'symbol?'
      | 'binary'
      | 'binary?'
      | 'alt'
      | 'alt?'
      | 'bool'
      | 'bool?'
      | 'func'
      | 'func?')

    /**
     * A Joi validation schema in form of JS code.
     *
     * Must be defined using the `!joi` YAML tag, which makes the `Joi`
     * namespace available to use and automatically prepends a `return` keyword
     * to the provided code.
     *
     * You can check out more examples of Joi validation at: https://joi.dev/api
     *
     * @example
     * inputs:
     *   // Accepts an optional string
     *   hello: string?
     *   // Fully validates that `world` will be a string of min 3 and max 30 chars
     *   world: !joi Joi.string().min(3).max(30)
     */
      | any;
}
// [block RecipeInputsInterface end]
//meta:RecipeInputsInterface:[{"unknownType":{"type":"alternatives","matches":[{"schema":{"type":"string","flags":{"only":true,"description":"\n    A string that represents a raw type, e.g. string, number, etc.\n    If ending with `?`, mark the input as optional.\n    "},"allow":["alternatives","alternatives?","any","any?","array","array?","boolean","boolean?","date","date?","function","function?","link","link?","number","number?","object","object?","string","string?","symbol","symbol?","binary","binary?","alt","alt?","bool","bool?","func","func?"]}},{"schema":{"type":"any","flags":{"description":"\n    A Joi validation schema in form of JS code.\n     \n    Must be defined using the `!joi` YAML tag, which makes the `Joi` \n    namespace available to use and automatically prepends a `return` keyword\n    to the provided code.\n    \n    You can check out more examples of Joi validation at: https://joi.dev/api\n    "},"rules":[{"name":"custom","args":{}}],"examples":["\n    inputs:\n      // Accepts an optional string\n      hello: string?\n      // Fully validates that `world` will be a string of min 3 and max 30 chars\n      world: !joi Joi.string().min(3).max(30)\n    "]}}]}},{"className":"RecipeInputsInterface"}]

// [block RecipeInterface begin]
export interface RecipeInterface {
  /**
   * The list of targets this recipe will run on.
   *
   * Note: this field is ignored in untrusted recipes.
   *
   * @example
   * targets:
   *   - lb-[0:5].hello.com
   *   - asinglemachine.hello.com
   */
  targets?: RecipeTargetsInterface; //typeRef:RecipeTargetsInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * Which phase this recipe belongs to.
   *
   * @default runtime
   */
  phase?:

    /**
     * Recipes are run in the boostrap phase when the agent is being installed
     * on the machine for the first time.
     */
    | 'bootstrap'

    /**
     * Recipes are normally run in the runtime phase.
     */
    | 'runtime';

  /**
   * If provided, these hosts' vars will also be fetched at recipe compile time.
   * Useful when e.g. recipes require other hosts' vars like IP addresses to
   * configure network access rules.
   */
  otherHosts?: RecipeTargetsInterface; //typeRef:RecipeTargetsInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * A list of additional recipe sources to use for this recipe.
   */
  recipeSources?: RecipeSourceListInterface; //typeRef:RecipeSourceListInterface:{"relPath":"../recipeSources/recipeSourceList.schema.gen.ts","isRegistryExport":false}

  /**
   * A friendly label, used to describe the recipe.
   */
  label?: string;

  /**
   * Inputs validation config.
   */
  inputs?: RecipeInputsInterface; //typeRef:RecipeInputsInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * A key/value map that lists which other recipes this recipe depends upon.
   * Dependencies are bundled at compile time and this list must be exhaustive.
   */
  dependencies?: {
    [x: string]: RecipeDependencyWithAlternativesInterface; //typeRef:RecipeDependencyWithAlternativesInterface:{"relPath":"self","isRegistryExport":false}
  };

  /**
   * The list of tasks to execute in this recipe.
   */
  tasks: TaskInterface[]; //link#See the definition of `TaskInterface`#/core/recipes#taskinterface

  /**
   * Hardcoded variables for this entry
   */
  vars?: VarsInterface; //typeRef:VarsInterface:{"relPath":"varsContainer.schema.gen.ts","isRegistryExport":false}

  /**
   * Compile-time vars sources for the entry
   */
  varsSources?: VarsSourcesInterface; //typeRef:VarsSourcesInterface:{"relPath":"varsContainer.schema.gen.ts","isRegistryExport":false}

  hostVars?: {
    [x: string]: VarsInterface; //typeRef:VarsInterface:{"relPath":"varsContainer.schema.gen.ts","isRegistryExport":false}
  };
  groupVars?: {
    [x: string]: VarsInterface; //typeRef:VarsInterface:{"relPath":"varsContainer.schema.gen.ts","isRegistryExport":false}
  };

  /**
   * If true, use only the recipe sources provided in the recipe config instead
   * of using the ones also provided by the recipe and the upper context
   */
  ignoreContextSources?: boolean;
}
// [block RecipeInterface end]
//meta:RecipeInterface:[{"className":"RecipeMinimalInterface"},{"className":"RecipeInterface"}]

// [block RecipeMinimalInterface begin]
export interface RecipeMinimalInterface {
  /**
   * A friendly label, used to describe the recipe.
   */
  label?: string;

  /**
   * Inputs validation config.
   */
  inputs?: RecipeInputsInterface; //typeRef:RecipeInputsInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * A key/value map that lists which other recipes this recipe depends upon.
   * Dependencies are bundled at compile time and this list must be exhaustive.
   */
  dependencies?: {
    [x: string]: RecipeDependencyWithAlternativesInterface; //typeRef:RecipeDependencyWithAlternativesInterface:{"relPath":"self","isRegistryExport":false}
  };

  /**
   * The list of tasks to execute in this recipe.
   */
  tasks: TaskInterface[]; //link#See the definition of `TaskInterface`#/core/recipes#taskinterface

  /**
   * Hardcoded variables for this entry
   */
  vars?: VarsInterface; //typeRef:VarsInterface:{"relPath":"varsContainer.schema.gen.ts","isRegistryExport":false}

  /**
   * Compile-time vars sources for the entry
   */
  varsSources?: VarsSourcesInterface; //typeRef:VarsSourcesInterface:{"relPath":"varsContainer.schema.gen.ts","isRegistryExport":false}

  hostVars?: {
    [x: string]: VarsInterface; //typeRef:VarsInterface:{"relPath":"varsContainer.schema.gen.ts","isRegistryExport":false}
  };
  groupVars?: {
    [x: string]: VarsInterface; //typeRef:VarsInterface:{"relPath":"varsContainer.schema.gen.ts","isRegistryExport":false}
  };
}
// [block RecipeMinimalInterface end]
//meta:RecipeMinimalInterface:[{"className":"RecipeMinimalInterface"}]

// [block RecipePhaseSchema begin]
/**
 * Which phase this recipe belongs to.
 *
 * @default runtime
 */
export type RecipePhaseSchema =


  /**
   * Recipes are run in the boostrap phase when the agent is being installed
   * on the machine for the first time.
   */
  | 'bootstrap'

  /**
   * Recipes are normally run in the runtime phase.
   */
  | 'runtime';
// [block RecipePhaseSchema end]
//meta:RecipePhaseSchema:undefined

// [block RecipeTargetsInterface begin]
export type RecipeTargetsInterface = string[];
// [block RecipeTargetsInterface end]
//meta:RecipeTargetsInterface:[{"className":"RecipeTargetsInterface"}]

// [block RecipeTestMockInterface begin]
export interface RecipeTestMockInterface {
  result: ModuleRunResultInterface; //typeRef:ModuleRunResultInterface:{"relPath":"../modules/abstractModuleBase.schema.gen.ts","isRegistryExport":false}

  /**
   * Unknown Property
   */
  [x: string]: unknown;
}
// [block RecipeTestMockInterface end]
//meta:RecipeTestMockInterface:[{"className":"TestMockBaseInterface"},{"className":"RecipeTestMockInterface"}]
