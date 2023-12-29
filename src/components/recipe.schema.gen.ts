/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
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
  | string
  | null
  | RecipeDependencyInterface; //typeRef:RecipeDependencyInterface:{"relPath":"self","isRegistryExport":false}

// [block RecipeDependencyWithAlternativesInterface end]
//meta:RecipeDependencyWithAlternativesInterface:[{"className":"RecipeDependencyWithAlternativesInterface"}]

// [block RecipeForArchiveInterface begin]
export interface RecipeForArchiveInterface {
  config: RecipeMinimalInterface; //typeRef:RecipeMinimalInterface:{"relPath":"self","isRegistryExport":false}

  targets?: RecipeTargetsInterface; //typeRef:RecipeTargetsInterface:{"relPath":"self","isRegistryExport":false}

  otherHosts?: RecipeTargetsInterface; //typeRef:RecipeTargetsInterface:{"relPath":"self","isRegistryExport":false}

}
// [block RecipeForArchiveInterface end]
//meta:RecipeForArchiveInterface:[{"className":"RecipeForArchiveInterface"}]

// [block RecipeInputsInterface begin]
export interface RecipeInputsInterface {
  [x: string]:
    | 'alternatives'
    | 'any'
    | 'array'
    | 'boolean'
    | 'date'
    | 'function'
    | 'link'
    | 'number'
    | 'object'
    | 'string'
    | 'symbol'
    | 'binary'
    | 'alt'
    | 'bool'
    | 'func'
    | any;
}
// [block RecipeInputsInterface end]
//meta:RecipeInputsInterface:[{"unknownType":{"type":"alternatives","matches":[{"schema":{"type":"string","allow":["alternatives","any","array","boolean","date","function","link","number","object","string","symbol","binary","alt","bool","func"]}},{"schema":{"type":"any","rules":[{"name":"custom","args":{}}]}}]}},{"className":"RecipeInputsInterface"}]

// [block RecipeInterface begin]
export interface RecipeInterface {
  dependencies?: {
    [x: string]: RecipeDependencyWithAlternativesInterface; //typeRef:RecipeDependencyWithAlternativesInterface:{"relPath":"self","isRegistryExport":false}

  };
  tasks: TaskInterface[]; //link#See the definition of `TaskInterface`#/core/recipes#taskinterface

  inputs?: RecipeInputsInterface; //typeRef:RecipeInputsInterface:{"relPath":"self","isRegistryExport":false}

  testMocks?: RecipeTestMockInterface[]; //typeRef:RecipeTestMockInterface:{"relPath":"self","isRegistryExport":false}

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
  targets?: RecipeTargetsInterface; //typeRef:RecipeTargetsInterface:{"relPath":"self","isRegistryExport":false}

  otherHosts?: RecipeTargetsInterface; //typeRef:RecipeTargetsInterface:{"relPath":"self","isRegistryExport":false}

  recipeSources?: RecipeSourceListInterface; //typeRef:RecipeSourceListInterface:{"relPath":"../recipeSources/recipeSourceList.schema.gen.ts","isRegistryExport":false}

  ignoreContextSources?: boolean;
}
// [block RecipeInterface end]
//meta:RecipeInterface:[{"className":"RecipeMinimalInterface"},{"className":"RecipeInterface"}]

// [block RecipeMinimalInterface begin]
export interface RecipeMinimalInterface {
  dependencies?: {
    [x: string]: RecipeDependencyWithAlternativesInterface; //typeRef:RecipeDependencyWithAlternativesInterface:{"relPath":"self","isRegistryExport":false}

  };
  tasks: TaskInterface[]; //link#See the definition of `TaskInterface`#/core/recipes#taskinterface

  inputs?: RecipeInputsInterface; //typeRef:RecipeInputsInterface:{"relPath":"self","isRegistryExport":false}

  testMocks?: RecipeTestMockInterface[]; //typeRef:RecipeTestMockInterface:{"relPath":"self","isRegistryExport":false}

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

// [block TestRecipeMinimalInterface begin]
export interface TestRecipeMinimalInterface {
  dependencies?: {
    [x: string]: RecipeDependencyWithAlternativesInterface; //typeRef:RecipeDependencyWithAlternativesInterface:{"relPath":"self","isRegistryExport":false}

  };
  tasks: TaskInterface[]; //link#See the definition of `TaskInterface`#/core/recipes#taskinterface

  inputs?: RecipeInputsInterface; //typeRef:RecipeInputsInterface:{"relPath":"self","isRegistryExport":false}

  testMocks?: RecipeTestMockInterface[]; //typeRef:RecipeTestMockInterface:{"relPath":"self","isRegistryExport":false}

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
// [block TestRecipeMinimalInterface end]
//meta:TestRecipeMinimalInterface:[{"className":"RecipeMinimalInterface"},{"className":"TestRecipeMinimalInterface"}]
