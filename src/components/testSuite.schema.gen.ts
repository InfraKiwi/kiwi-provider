// Generated with: yarn gen -> cmd/schemaGen.ts

/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

import { RecipeDependencyWithAlternativesInterface, RecipeInputsInterface, RecipeTestMockInterface, RecipeMinimalInterface } from './recipe.schema.gen';
import { VarsInterface } from './varsContainer.schema.gen';
import { TaskInterface } from './task.schema.gen';

export interface TestRecipeInterface {
  dependencies?: {
    [x: string]: RecipeDependencyWithAlternativesInterface;
  };
  groupVars?: {
    [x: string]: VarsInterface;
  };
  hostVars?: {
    [x: string]: VarsInterface;
  };
  inputs?: RecipeInputsInterface;
  label?: string;
  tasks: TaskInterface[];
  testId?: string;
  testMocks?: RecipeTestMockInterface[];
  vars?: VarsInterface;
}

export interface TestRunnerInterface {
  /**
   * Unknown Property
   */
  [x: string]: unknown;
}

export interface TestSuiteInterface {
  afterAll?: RecipeMinimalInterface;
  afterEach?: RecipeMinimalInterface;
  beforeAll?: RecipeMinimalInterface;
  beforeEach?: RecipeMinimalInterface;
  clean?: boolean;
  runner: TestRunnerInterface;
  tests: TestRecipeInterface[];
}
