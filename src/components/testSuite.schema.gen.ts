// Generated with: yarn gen -> cmd/schemaGen.ts

import type { RecipeDependencyWithAlternativesInterface, RecipeInputsInterface, RecipeTestMockInterface, RecipeMinimalInterface } from './recipe.schema.gen';
import type { TaskInterface } from './task.schema.gen';
import type { VarsInterface, VarsSourcesInterface } from './varsContainer.schema.gen';

// [block TestRecipeInterface begin]
export interface TestRecipeInterface {
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
  label?: string;
  testId?: string;
}
// [block TestRecipeInterface end]

// [block TestRunnerInterface begin]
export interface TestRunnerInterface {
  /**
   * Unknown Property
   */
  [x: string]: unknown;
}
// [block TestRunnerInterface end]

// [block TestSuiteInterface begin]
export interface TestSuiteInterface {
  runner: TestRunnerInterface; //typeRef:TestRunnerInterface:testSuite.schema.gen.ts:false

  clean?: boolean;
  beforeAll?: RecipeMinimalInterface; //typeRef:RecipeMinimalInterface:recipe.schema.gen.ts:false

  afterAll?: RecipeMinimalInterface; //typeRef:RecipeMinimalInterface:recipe.schema.gen.ts:false

  beforeEach?: RecipeMinimalInterface; //typeRef:RecipeMinimalInterface:recipe.schema.gen.ts:false

  afterEach?: RecipeMinimalInterface; //typeRef:RecipeMinimalInterface:recipe.schema.gen.ts:false

  tests: TestRecipeInterface[]; //typeRef:TestRecipeInterface:testSuite.schema.gen.ts:false

}
// [block TestSuiteInterface end]
