/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

import type { RecipeSourceListInterface } from '../recipeSources/recipeSourceList.schema.gen';

import type { RecipeInputsInterface, RecipeDependencyWithAlternativesInterface, RecipeTestMockInterface } from './recipe.schema.gen';
import type { TaskInterface } from './task.schema.gen';
import type { VarsInterface, VarsSourcesInterface } from './varsContainer.schema.gen';

// [block TestRecipeInterface begin]
export interface TestRecipeInterface {
  /**
   * A friendly label, used to describe the recipe.
   */
  label?: string;

  /**
   * Inputs validation config.
   */
  inputs?: RecipeInputsInterface; //typeRef:RecipeInputsInterface:{"relPath":"recipe.schema.gen.ts","isRegistryExport":false}

  /**
   * A key/value map that lists which other recipes this recipe depends upon.
   * Dependencies are bundled at compile time and this list must be exhaustive.
   */
  dependencies?: {
    [x: string]: RecipeDependencyWithAlternativesInterface; //typeRef:RecipeDependencyWithAlternativesInterface:{"relPath":"recipe.schema.gen.ts","isRegistryExport":false}
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
   * A list of test mocks to apply to this recipe's execution.
   */
  testMocks?: RecipeTestMockInterface[]; //typeRef:RecipeTestMockInterface:{"relPath":"recipe.schema.gen.ts","isRegistryExport":false}

  /**
   * An optional id that can be used when referring to this test.
   */
  testId?: string;
}
// [block TestRecipeInterface end]
//meta:TestRecipeInterface:[{"className":"RecipeMinimalInterface"},{"className":"TestRecipeMinimalInterface"},{"className":"TestRecipeInterface"}]

// [block TestRecipeMinimalInterface begin]
export interface TestRecipeMinimalInterface {
  /**
   * A friendly label, used to describe the recipe.
   */
  label?: string;

  /**
   * Inputs validation config.
   */
  inputs?: RecipeInputsInterface; //typeRef:RecipeInputsInterface:{"relPath":"recipe.schema.gen.ts","isRegistryExport":false}

  /**
   * A key/value map that lists which other recipes this recipe depends upon.
   * Dependencies are bundled at compile time and this list must be exhaustive.
   */
  dependencies?: {
    [x: string]: RecipeDependencyWithAlternativesInterface; //typeRef:RecipeDependencyWithAlternativesInterface:{"relPath":"recipe.schema.gen.ts","isRegistryExport":false}
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
   * A list of test mocks to apply to this recipe's execution.
   */
  testMocks?: RecipeTestMockInterface[]; //typeRef:RecipeTestMockInterface:{"relPath":"recipe.schema.gen.ts","isRegistryExport":false}
}
// [block TestRecipeMinimalInterface end]
//meta:TestRecipeMinimalInterface:[{"className":"RecipeMinimalInterface"},{"className":"TestRecipeMinimalInterface"}]

// [block TestRunnerInterface begin]
export interface TestRunnerInterface {
  /**
   * The test runner to use.
   * You can check the available test runners here: ##link#See all available test runners#/runners
   */
  [x: string]: any;
}
// [block TestRunnerInterface end]
//meta:TestRunnerInterface:[{"className":"TestRunnerInterface"},{"unknownType":{"type":"any","flags":{"description":"\n  The test runner to use.\n  You can check the available test runners here: ##link#See all available test runners#/runners\n"}}}]

// [block TestSuiteInterface begin]
export interface TestSuiteInterface {
  /**
   * Where is the test suite running? e.g. in a docker container spun up for the purpose.
   */
  runner: TestRunnerInterface; //typeRef:TestRunnerInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * If true, each test will be executed in a clean new runner.
   */
  clean?: boolean;

  /**
   * A list of additional recipe sources to use for this test suite.
   */
  recipeSources?: RecipeSourceListInterface; //typeRef:RecipeSourceListInterface:{"relPath":"../recipeSources/recipeSourceList.schema.gen.ts","isRegistryExport":false}

  /**
   * A minimal recipe config, which will be executed at the beginning of the test suite execution.
   */
  beforeAll?: TestRecipeMinimalInterface; //typeRef:TestRecipeMinimalInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * A minimal recipe config, which will be executed at the end of the test suite execution.
   */
  afterAll?: TestRecipeMinimalInterface; //typeRef:TestRecipeMinimalInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * A minimal recipe config, which will be executed before each test.
   */
  beforeEach?: TestRecipeMinimalInterface; //typeRef:TestRecipeMinimalInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * A minimal recipe config, which will be executed after each test.
   */
  afterEach?: TestRecipeMinimalInterface; //typeRef:TestRecipeMinimalInterface:{"relPath":"self","isRegistryExport":false}

  /**
   * An array of minimal recipes, each defining a test.
   */
  tests: TestRecipeInterface[]; //typeRef:TestRecipeInterface:{"relPath":"self","isRegistryExport":false}
}
// [block TestSuiteInterface end]
//meta:TestSuiteInterface:[{"className":"TestSuiteInterface"}]
