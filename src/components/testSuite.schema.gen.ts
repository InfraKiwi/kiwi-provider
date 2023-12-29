/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// Generated with: yarn gen -> cmd/schemaGen.ts

import type { RecipeDependencyWithAlternativesInterface, RecipeInputsInterface, RecipeTestMockInterface, RecipeMinimalInterface } from './recipe.schema.gen';
import type { TaskInterface } from './task.schema.gen';
import type { VarsInterface, VarsSourcesInterface } from './varsContainer.schema.gen';

// [block TestRecipeInterface begin]
export interface TestRecipeInterface {
  dependencies?: {
    [x: string]: RecipeDependencyWithAlternativesInterface; //typeRef:RecipeDependencyWithAlternativesInterface:{"relPath":"recipe.schema.gen.ts","isRegistryExport":false}

  };
  tasks: TaskInterface[]; //link#See the definition of `TaskInterface`#/core/recipes#taskinterface

  inputs?: RecipeInputsInterface; //typeRef:RecipeInputsInterface:{"relPath":"recipe.schema.gen.ts","isRegistryExport":false}

  testMocks?: RecipeTestMockInterface[]; //typeRef:RecipeTestMockInterface:{"relPath":"recipe.schema.gen.ts","isRegistryExport":false}

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
  label?: string;
  testId?: string;
}
// [block TestRecipeInterface end]
//meta:TestRecipeInterface:[{"className":"RecipeMinimalInterface"},{"className":"TestRecipeMinimalInterface"},{"className":"TestRecipeInterface"}]

// [block TestRunnerInterface begin]
export interface TestRunnerInterface {
  /**
   * Unknown Property
   */
  [x: string]: unknown;
}
// [block TestRunnerInterface end]
//meta:TestRunnerInterface:[{"className":"TestRunnerInterface"}]

// [block TestSuiteInterface begin]
export interface TestSuiteInterface {
  runner: TestRunnerInterface; //typeRef:TestRunnerInterface:{"relPath":"self","isRegistryExport":false}

  clean?: boolean;
  beforeAll?: RecipeMinimalInterface; //typeRef:RecipeMinimalInterface:{"relPath":"recipe.schema.gen.ts","isRegistryExport":false}

  afterAll?: RecipeMinimalInterface; //typeRef:RecipeMinimalInterface:{"relPath":"recipe.schema.gen.ts","isRegistryExport":false}

  beforeEach?: RecipeMinimalInterface; //typeRef:RecipeMinimalInterface:{"relPath":"recipe.schema.gen.ts","isRegistryExport":false}

  afterEach?: RecipeMinimalInterface; //typeRef:RecipeMinimalInterface:{"relPath":"recipe.schema.gen.ts","isRegistryExport":false}

  tests: TestRecipeInterface[]; //typeRef:TestRecipeInterface:{"relPath":"self","isRegistryExport":false}

}
// [block TestSuiteInterface end]
//meta:TestSuiteInterface:[{"className":"TestSuiteInterface"}]
