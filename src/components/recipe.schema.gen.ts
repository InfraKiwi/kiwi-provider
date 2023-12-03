import type { RecipeSourceListInterface } from '../recipeSources/recipeSourceList.schema.gen';
import type { ModuleRunResultInterface } from '../modules/abstractModuleBase.schema.gen';
// Generated with: yarn gen -> cmd/schemaGen.ts

import type { VarsInterface, VarsSourcesInterface } from './varsContainer.schema.gen';
import type { TaskInterface } from './task.schema.gen';

// [block HostVarsBlockInterface begin]
export interface HostVarsBlockInterface {
  hostVars?: {
    [x: string]: VarsInterface; //typeRef:VarsInterface:varsContainer.schema.gen.ts:false

  };
  groupVars?: {
    [x: string]: VarsInterface; //typeRef:VarsInterface:varsContainer.schema.gen.ts:false

  };
}
// [block HostVarsBlockInterface end]

// [block RecipeDependencyInterface begin]
export interface RecipeDependencyInterface {
  version?: string;
  sourceId?: string;
}
// [block RecipeDependencyInterface end]

// [block RecipeDependencyWithAlternativesInterface begin]
export type RecipeDependencyWithAlternativesInterface =
  | string
  | null
  | RecipeDependencyInterface; //typeRef:RecipeDependencyInterface:recipe.schema.gen.ts:false

// [block RecipeDependencyWithAlternativesInterface end]

// [block RecipeForArchiveInterface begin]
export interface RecipeForArchiveInterface {
  config: RecipeMinimalInterface; //typeRef:RecipeMinimalInterface:recipe.schema.gen.ts:false

  targets?: RecipeTargetsInterface; //typeRef:RecipeTargetsInterface:recipe.schema.gen.ts:false

  otherHosts?: RecipeTargetsInterface; //typeRef:RecipeTargetsInterface:recipe.schema.gen.ts:false

}
// [block RecipeForArchiveInterface end]

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

// [block RecipeInterface begin]
export interface RecipeInterface {
  dependencies?: {
    [x: string]: RecipeDependencyWithAlternativesInterface; //typeRef:RecipeDependencyWithAlternativesInterface:recipe.schema.gen.ts:false

  };
  tasks: TaskInterface[]; //typeRef:TaskInterface:task.schema.gen.ts:false

  inputs?: RecipeInputsInterface; //typeRef:RecipeInputsInterface:recipe.schema.gen.ts:false

  testMocks?: RecipeTestMockInterface[]; //typeRef:RecipeTestMockInterface:recipe.schema.gen.ts:false

  /**
   * Hardcoded variables for this entry
   */
  vars?: VarsInterface; //typeRef:VarsInterface:varsContainer.schema.gen.ts:false

  /**
   * Compile-time vars sources for the entry
   */
  varsSources?: VarsSourcesInterface; //typeRef:VarsSourcesInterface:varsContainer.schema.gen.ts:false

  hostVars?: {
    [x: string]: VarsInterface; //typeRef:VarsInterface:varsContainer.schema.gen.ts:false

  };
  groupVars?: {
    [x: string]: VarsInterface; //typeRef:VarsInterface:varsContainer.schema.gen.ts:false

  };
  targets?: RecipeTargetsInterface; //typeRef:RecipeTargetsInterface:recipe.schema.gen.ts:false

  otherHosts?: RecipeTargetsInterface; //typeRef:RecipeTargetsInterface:recipe.schema.gen.ts:false

  recipeSources?: RecipeSourceListInterface; //typeRef:RecipeSourceListInterface:../recipeSources/recipeSourceList.schema.gen.ts:false

  ignoreContextSources?: boolean;
}
// [block RecipeInterface end]

// [block RecipeMinimalInterface begin]
export interface RecipeMinimalInterface {
  dependencies?: {
    [x: string]: RecipeDependencyWithAlternativesInterface; //typeRef:RecipeDependencyWithAlternativesInterface:recipe.schema.gen.ts:false

  };
  tasks: TaskInterface[]; //typeRef:TaskInterface:task.schema.gen.ts:false

  inputs?: RecipeInputsInterface; //typeRef:RecipeInputsInterface:recipe.schema.gen.ts:false

  testMocks?: RecipeTestMockInterface[]; //typeRef:RecipeTestMockInterface:recipe.schema.gen.ts:false

  /**
   * Hardcoded variables for this entry
   */
  vars?: VarsInterface; //typeRef:VarsInterface:varsContainer.schema.gen.ts:false

  /**
   * Compile-time vars sources for the entry
   */
  varsSources?: VarsSourcesInterface; //typeRef:VarsSourcesInterface:varsContainer.schema.gen.ts:false

  hostVars?: {
    [x: string]: VarsInterface; //typeRef:VarsInterface:varsContainer.schema.gen.ts:false

  };
  groupVars?: {
    [x: string]: VarsInterface; //typeRef:VarsInterface:varsContainer.schema.gen.ts:false

  };
}
// [block RecipeMinimalInterface end]

// [block RecipeTargetsInterface begin]
export type RecipeTargetsInterface = string[];
// [block RecipeTargetsInterface end]

// [block RecipeTestMockInterface begin]
export interface RecipeTestMockInterface {
  result: ModuleRunResultInterface; //typeRef:ModuleRunResultInterface:../modules/abstractModuleBase.schema.gen.ts:false

  /**
   * Unknown Property
   */
  [x: string]: unknown;
}
// [block RecipeTestMockInterface end]

// [block TestRecipeMinimalInterface begin]
export interface TestRecipeMinimalInterface {
  dependencies?: {
    [x: string]: RecipeDependencyWithAlternativesInterface; //typeRef:RecipeDependencyWithAlternativesInterface:recipe.schema.gen.ts:false

  };
  tasks: TaskInterface[]; //typeRef:TaskInterface:task.schema.gen.ts:false

  inputs?: RecipeInputsInterface; //typeRef:RecipeInputsInterface:recipe.schema.gen.ts:false

  testMocks?: RecipeTestMockInterface[]; //typeRef:RecipeTestMockInterface:recipe.schema.gen.ts:false

  /**
   * Hardcoded variables for this entry
   */
  vars?: VarsInterface; //typeRef:VarsInterface:varsContainer.schema.gen.ts:false

  /**
   * Compile-time vars sources for the entry
   */
  varsSources?: VarsSourcesInterface; //typeRef:VarsSourcesInterface:varsContainer.schema.gen.ts:false

  hostVars?: {
    [x: string]: VarsInterface; //typeRef:VarsInterface:varsContainer.schema.gen.ts:false

  };
  groupVars?: {
    [x: string]: VarsInterface; //typeRef:VarsInterface:varsContainer.schema.gen.ts:false

  };
}
// [block TestRecipeMinimalInterface end]
