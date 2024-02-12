/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import {
  TestRunnerSchema,
  testSuiteRecipeIdAfterAll,
  testSuiteRecipeIdAfterEach,
  testSuiteRecipeIdBeforeAll,
  testSuiteRecipeIdBeforeEach,
  TestSuiteSchema,
} from './testSuite.schema';
import Joi from 'joi';
import type { RecipeCtorContext } from './recipe';
import { RecipeTestMock } from './recipe';
import { Recipe } from './recipe';
import { Archive } from './archive';
import type { ContextLogger } from '../util/context';
import { fsPromiseTmpDir, fsPromiseTmpFile } from '../util/fs';
import type { TestRecipeMinimalInterface, TestSuiteInterface } from './testSuite.schema.gen';
import type { AbstractRunnerInstance } from '../runners/abstractRunner';
import { joiAttemptRequired, joiKeepOnlyKeysInJoiSchema } from '../util/joi';
import { RecipeMinimalSchema } from './recipe.schema';
import type { RecipeInterface } from './recipe.schema.gen';
import { runnerRegistry } from '../runners/registry';
import type { RunStatistics } from '../util/runContext';
import '../util/loadAllRegistryEntries.testSuite.gen';
import { Table } from 'console-table-printer';
import { secondsToHMS } from '../util/date';
import { RecipeSourceList } from '../recipeSources/recipeSourceList';
import path from 'node:path';

interface TestMetadata {
  fileName?: string;
}

interface TestRecipe {
  before?: string;
  recipeId: string;
  after?: string;
}

interface TestArchive {
  archive: Archive;
  archiveFile: string;
  testRecipes: TestRecipe[];
}

export interface TestSuiteTestSetResult {
  tests: Record<string, RunStatistics>;
  runOrder: string[];
}

export interface TestSuiteResult {
  // If null, the whole test setup has failed
  testResults: Record<string, TestSuiteTestSetResult | null>;
  runOrder: string[];
}

function extractTestMocks(config: TestRecipeMinimalInterface) {
  return (config.testMocks ?? []).map((mockConfig) => new RecipeTestMock(mockConfig));
}

export class TestSuite {
  config: TestSuiteInterface;
  meta?: TestMetadata;

  constructor(config: TestSuiteInterface, meta?: TestMetadata) {
    this.config = joiAttemptRequired(config, TestSuiteSchema);
    this.meta = meta;

    // Validate runner
    runnerRegistry.findRegistryEntryFromIndexedConfig(this.config.runner, TestRunnerSchema);
  }

  async #prepareTestArchive(context: RecipeCtorContext): Promise<TestArchive> {
    if (this.config.recipeSources) {
      context.recipeSources = RecipeSourceList.mergePrepend(
        context,
        new RecipeSourceList(context, this.config.recipeSources),
        context.recipeSources
      );
    }

    const recipes: Recipe[] = [];
    const testRecipes: TestRecipe[] = [];

    if (this.config.beforeAll) {
      const recipe = new Recipe(context, this.config.beforeAll, {
        id: testSuiteRecipeIdBeforeAll,
        testMocks: extractTestMocks(this.config.beforeAll),
        fileName: this.meta?.fileName,
      });
      recipes.push(recipe);
      testRecipes.push({ recipeId: recipe.fullId! });
    }

    if (this.config.beforeEach) {
      recipes.push(
        new Recipe(context, this.config.beforeEach, {
          id: testSuiteRecipeIdBeforeEach,
          testMocks: extractTestMocks(this.config.beforeEach),
          fileName: this.meta?.fileName,
        })
      );
    }
    if (this.config.afterEach) {
      recipes.push(
        new Recipe(context, this.config.afterEach, {
          id: testSuiteRecipeIdAfterEach,
          testMocks: extractTestMocks(this.config.afterEach),
          fileName: this.meta?.fileName,
        })
      );
    }

    for (let i = 0; i < this.config.tests.length; i++) {
      const testConfig = this.config.tests[i];
      const id = Recipe.cleanId(testConfig.testId ?? testConfig.name ?? `test_${i}`);
      const recipeConfig: RecipeInterface = joiKeepOnlyKeysInJoiSchema(testConfig, RecipeMinimalSchema);
      const recipe = new Recipe(context, recipeConfig, {
        id,
        testMocks: extractTestMocks(testConfig),
        fileName: this.meta?.fileName,
      });
      recipes.push(recipe);

      testRecipes.push({
        before: this.config.beforeEach ? testSuiteRecipeIdBeforeEach : undefined,
        recipeId: recipe.fullId!,
        after: this.config.afterEach ? testSuiteRecipeIdAfterEach : undefined,
      });
    }

    if (this.config.afterAll) {
      const recipe = new Recipe(context, this.config.afterAll, {
        id: testSuiteRecipeIdAfterAll,
        testMocks: extractTestMocks(this.config.afterAll),
        fileName: this.meta?.fileName,
      });
      recipes.push(recipe);
      testRecipes.push({ recipeId: recipe.fullId! });
    }

    const archiveDir = await fsPromiseTmpDir({});
    const archive = await Archive.create(context, {
      includeTestAssets: true,
      archiveDir,
      recipes,
    });
    const archiveFile = await fsPromiseTmpFile({
      keep: false,
      discardDescriptor: true,
      postfix: '.tar.gz',
    });
    await archive.saveToTarArchive(archiveFile);

    return {
      archive,
      archiveFile,
      testRecipes,
    };
  }

  async run(context: RecipeCtorContext, testIds?: string[]): Promise<TestSuiteResult> {
    const testSuiteResult: TestSuiteResult = {
      testResults: {},
      runOrder: [],
    };

    context = {
      ...context,
      // Default the run context to start in the same folder as the test suite file
      workDir: context.workDir ?? (this.meta?.fileName ? path.dirname(this.meta.fileName) : undefined),
    };

    const { testRecipes, archiveFile } = await this.#prepareTestArchive(context);

    if (testIds) {
      testIds = testIds.map((id) => Recipe.cleanId(id));
      joiAttemptRequired(
        testIds,
        Joi.array().items(Joi.string().valid(...testRecipes.map((r) => r.recipeId))),
        'Failed to find defined test ids in the test suite archive'
      );
    }

    const recipesToRun: string[] = [];
    for (const testRecipe of testRecipes) {
      const recipeId = testRecipe.recipeId;
      if (
        testIds &&
        !testIds.includes(recipeId) &&
        // Before all and after all will always run!
        recipeId != testSuiteRecipeIdBeforeAll &&
        recipeId != testSuiteRecipeIdAfterAll
      ) {
        continue;
      }
      recipesToRun.push(recipeId);

      // Set to null which means we started the test at least
      testSuiteResult.testResults[recipeId] = null;
      testSuiteResult.runOrder.push(recipeId);
    }

    if (this.config.clean) {
      for (const testRecipe of testRecipes) {
        if (!recipesToRun.includes(testRecipe.recipeId)) {
          continue;
        }

        const runner = runnerRegistry.getRegistryEntryInstanceFromIndexedConfig<AbstractRunnerInstance>(
          this.config.runner,
          TestRunnerSchema
        );

        try {
          await runner.setUp(context);
          const archiveDir = await runner.uploadAndExtractTarGZArchive(context, archiveFile);
          await this.#runTestSuiteRecipe(context, runner, archiveDir, testRecipe, testSuiteResult);
        } finally {
          // Make sure to always terminate runners
          await runner
            .tearDown(context)
            .catch((ex) => context.logger.error('Failed to teardown test runner', { error: ex }));
        }
      }
      return testSuiteResult;
    }

    const runner = runnerRegistry.getRegistryEntryInstanceFromIndexedConfig<AbstractRunnerInstance>(
      this.config.runner,
      TestRunnerSchema
    );

    try {
      await runner.setUp(context);
      const archiveDir = await runner.uploadAndExtractTarGZArchive(context, archiveFile);

      for (const testRecipe of testRecipes) {
        if (!recipesToRun.includes(testRecipe.recipeId)) {
          continue;
        }
        await this.#runTestSuiteRecipe(context, runner, archiveDir, testRecipe, testSuiteResult);
      }
    } finally {
      // Make sure to always terminate runners
      await runner
        .tearDown(context)
        .catch((ex) => context.logger.error('Failed to teardown test runner', { error: ex }));
    }

    return testSuiteResult;
  }

  async #runTestSuiteRecipe(
    context: ContextLogger,
    runner: AbstractRunnerInstance,
    archiveDir: string,
    testRecipe: TestRecipe,
    testSuiteResult: TestSuiteResult
  ) {
    const restResult: TestSuiteTestSetResult = {
      tests: {},
      runOrder: [],
    };
    testSuiteResult.testResults[testRecipe.recipeId] = restResult;

    const recipeIds = [
      ...(testRecipe.before ? [testRecipe.before] : []),
      testRecipe.recipeId,
      ...(testRecipe.after ? [testRecipe.after] : []),
    ];

    context.logger.info('Running recipes', {
      recipeId: testRecipe.recipeId,
      allIds: recipeIds,
    });
    const runResult = await runner.runRecipes(
      {
        ...context,
        testingMode: true,
      },
      archiveDir,
      recipeIds
    );
    for (const recipeId in runResult.statistics) {
      const statistics = runResult.statistics[recipeId];
      restResult.tests[recipeId] = statistics;
      restResult.runOrder.push(recipeId);
    }
  }

  static printTestSuiteResult(result: TestSuiteResult) {
    for (const testId of result.runOrder) {
      process.stdout.write('### test: ' + testId + '\n\n');

      const testResults = result.testResults[testId];
      if (testResults == null) {
        process.stdout.write('Result: not started' + '\n\n');
        continue;
      }

      const table = new Table({ columns: [{ name: 'recipeId' }, { name: 'elapsed' }, { name: 'status' }] });

      for (const recipeId of testResults.runOrder) {
        const result = testResults.tests[recipeId];
        const elapsed = result.endTime ? secondsToHMS((result.endTime - result.startTime) / 1000) : 'Unknown';
        const status = result.failed ? 'Failed' : 'Success';
        table.addRow(
          {
            recipeId,
            elapsed,
            status,
          },
          { color: result.failed ? 'red' : undefined }
        );
      }

      table.printTable();
    }
  }
}
