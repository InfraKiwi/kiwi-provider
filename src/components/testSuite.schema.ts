import Joi from 'joi';
import { joiMetaClassName } from '../util/joi';
import { RecipeMinimalSchema, TestRecipeMinimalSchema } from './recipe.schema';

export const testSuiteRecipeIdBeforeAll = '__testSuiteBeforeAll';
export const testSuiteRecipeIdAfterAll = '__testSuiteAfterAll';
export const testSuiteRecipeIdBeforeEach = '__testSuiteBeforeEach';
export const testSuiteRecipeIdAfterEach = '__testSuiteAfterEach';

export const TestRunnerSchema = Joi.object().unknown(true).meta(joiMetaClassName('TestRunnerInterface'));

export const TestRecipeSchema = TestRecipeMinimalSchema.append({
  // A friendly label, used to describe the test
  label: Joi.string(),

  // An optional id that can be used when referring to this test
  testId: Joi.string(),
}).meta(joiMetaClassName('TestRecipeInterface'));

export const TestSuiteSchema = Joi.object({
  // Where is the test suite running? e.g. in a docker container spun up for the purpose
  runner: TestRunnerSchema.required(),

  // If true, each test will be executed in a clean new runner
  clean: Joi.boolean(),

  beforeAll: RecipeMinimalSchema,
  afterAll: RecipeMinimalSchema,
  beforeEach: RecipeMinimalSchema,
  afterEach: RecipeMinimalSchema,

  tests: Joi.array().items(TestRecipeSchema).min(1).required(),
}).meta({ className: 'TestSuiteInterface' });
