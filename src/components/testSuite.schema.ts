/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { joiMetaClassName, joiMetaUnknownType } from '../util/joi';
import { RecipeMinimalSchema, RecipeTestMockSchema } from './recipe.schema';
import { RecipeSourceListSchema } from '../recipeSources/recipeSourceList.schema';

export const testSuiteRecipeIdBeforeAll = '__testSuiteBeforeAll';
export const testSuiteRecipeIdAfterAll = '__testSuiteAfterAll';
export const testSuiteRecipeIdBeforeEach = '__testSuiteBeforeEach';
export const testSuiteRecipeIdAfterEach = '__testSuiteAfterEach';

export const TestRunnerSchema = Joi.object()
  .unknown(true)
  .meta(joiMetaClassName('TestRunnerInterface'))
  .meta(
    joiMetaUnknownType(
      Joi.any().description(`
  The test runner to use.
  You can check the available test runners here: ##link#See all available test runners#/runners
`)
    )
  );

export const TestRecipeMinimalSchema = RecipeMinimalSchema.append({
  testMocks: Joi.array().items(RecipeTestMockSchema).description(`
    A list of test mocks to apply to this recipe's execution.
  `),
}).meta(joiMetaClassName('TestRecipeMinimalInterface'));

export const TestRecipeSchema = TestRecipeMinimalSchema.append({
  testId: Joi.string().description(`
  An optional id that can be used when referring to this test.
  `),
}).meta(joiMetaClassName('TestRecipeInterface'));

export const TestSuiteSchema = Joi.object({
  runner: TestRunnerSchema.required().description(`
  Where is the test suite running? e.g. in a docker container spun up for the purpose.
  `),

  clean: Joi.boolean().description(`
  If true, each test will be executed in a clean new runner.
  `),

  recipeSources: RecipeSourceListSchema.description(`
    A list of additional recipe sources to use for this test suite.
  `),

  beforeAll: TestRecipeMinimalSchema.description(`
  A minimal recipe config, which will be executed at the beginning of the test suite execution.
  `),
  afterAll: TestRecipeMinimalSchema.description(`
  A minimal recipe config, which will be executed at the end of the test suite execution.
  `),
  beforeEach: TestRecipeMinimalSchema.description(`
  A minimal recipe config, which will be executed before each test.
  `),
  afterEach: TestRecipeMinimalSchema.description(`
  A minimal recipe config, which will be executed after each test.
  `),

  tests: Joi.array().items(TestRecipeSchema).min(1).required().description(`
  An array of minimal recipes, each defining a test.
  `),
}).meta({ className: 'TestSuiteInterface' });
