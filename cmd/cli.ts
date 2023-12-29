/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { ParseArgsConfig } from 'node:util';
import { parseArgs } from 'node:util';
import Joi from 'joi';
import { joiParseArgsLogOptionsSchema, newLoggerFromParseArgs, parseArgsLogOptions } from '../src/util/logger';
import { checkVersionCommand, getArgDefault } from '../src/util/args';
import * as os from 'node:os';
import '../src/util/loadAllRegistryEntries.gen';
import { joiValidateShortieObject, joiValidateSyncFSExists } from '../src/util/joi';
import type { RecipeSourceCtorContext } from '../src/recipeSources/recipeSourceList';
import { RecipeSourceList } from '../src/recipeSources/recipeSourceList';
import type { RecipeCtorContext } from '../src/components/recipe';
import { Recipe } from '../src/components/recipe';
import { setupUncaughtHandler } from '../src/util/uncaught';
import { shortieToObject } from '../src/util/shortie';
import { runRecipesFromArchive } from '../src/commands/runRecipeFromArchive';
import { getErrorCauseChain } from '../src/util/error';
import { fsPromiseTmpDir, fsPromiseTmpFile, fsPromiseWriteFile } from '../src/util/fs';
import type { MyPartialRunContextOmit, RunStatistics } from '../src/util/runContext';
import { newRunStatistics } from '../src/util/runContext';
import { TestSuite } from '../src/components/testSuite';
import type { ContextLogger } from '../src/util/context';
import type { AbstractRunnerInstance } from '../src/runners/abstractRunner';
import { TestRunnerSchema } from '../src/components/testSuite.schema';
import { runnerRegistry } from '../src/runners/registry';
import type { RegistryEntryGenericConfig } from '../src/util/registry';
import { Archive } from '../src/components/archive';
import { Inventory } from '../src/components/inventory';
import { runRecipe } from '../src/commands/runRecipe';

import { loadYAMLFromFile } from '../src/util/yaml';

enum MainCommand {
  run = 'run',
  runRecipeFromFile = 'runRecipeFromFile',
  runRecipesFromArchive = 'runRecipesFromArchive',
  test = 'test',
}

async function main() {
  checkVersionCommand();

  const args = process.argv.slice(2);
  let mainCommand = args[0] as MainCommand;
  const mainCommandArgs = args.slice(1);

  switch (mainCommand) {
    case MainCommand.run:
    case MainCommand.runRecipeFromFile:
      mainCommand = MainCommand.runRecipeFromFile;
      break;
    // Command used by the test suite to run recipes uploaded to a runner
    case MainCommand.runRecipesFromArchive:
      break;
    case MainCommand.test:
      return runTestSuite(mainCommandArgs);
    default:
      throw new Error(`Invalid command ${mainCommand as string}. Supported: ${Object.values(MainCommand).join(',')}`);
  }
  const isArchive = mainCommand == MainCommand.runRecipesFromArchive;

  const argsConfig: ParseArgsConfig = {
    allowPositionals: true,
    strict: true,
    options: {
      ...parseArgsLogOptions,

      hostname: {
        type: 'string',
        short: 'h',
        default: os.hostname(),
      },
      inventoryPath: {
        type: 'string',
        short: 'i',
      },
      source: {
        type: 'string',
        short: 's',
        multiple: true,
      },
      throwOnRecipeFailure: { type: 'boolean' },
      statsFileName: { type: 'string' },
    },
  };

  let argsValidation = joiParseArgsLogOptionsSchema.append({
    hostname: Joi.string().default(getArgDefault(argsConfig, 'hostname')),
    inventoryPath: Joi.string(),
    source: Joi.array().items(Joi.string()).default([]),
    throwOnRecipeFailure: Joi.boolean().default(false),
    statsFileName: Joi.string(),
  });

  if (isArchive) {
    argsConfig.options!.archiveDir = {
      type: 'string',
      short: 'a',
    };
    argsConfig.options!.testingMode = { type: 'boolean' };

    argsValidation = argsValidation.append({
      archiveDir: Joi.string().custom(joiValidateSyncFSExists).required(),
      testingMode: Joi.boolean().default(false),
    });
  } else {
    argsConfig.options!.runner = { type: 'string' };

    argsValidation = argsValidation.append({
      runner: Joi.string().custom(joiValidateShortieObject),
    });
  }

  const { positionals, values } = parseArgs({
    ...argsConfig,
    args: mainCommandArgs,
  });
  const {
    source,
    hostname,
    inventoryPath,
    throwOnRecipeFailure,
    statsFileName,

    // Archive-specific entries
    archiveDir,
    testingMode,

    // Run-specific entries
    runner,

    ...otherArgs
  } = Joi.attempt(values, argsValidation, 'Error evaluating command args:');
  const logger = newLoggerFromParseArgs(otherArgs);
  setupUncaughtHandler(logger);

  const recipeSourceCtorContext: RecipeSourceCtorContext = {
    logger,
    workDir: process.cwd(),
  };

  const recipeSources = getRecipeSourcesFromSourceArg(recipeSourceCtorContext, source);
  const context: RecipeCtorContext & Partial<MyPartialRunContextOmit> = {
    ...recipeSourceCtorContext,
    recipeSources,
    isTesting: testingMode,
  };

  if (isArchive) {
    const recipeIds = positionals;
    await runRecipeFromArchive(
      context,
      recipeIds,

      archiveDir,

      inventoryPath,
      hostname,
      throwOnRecipeFailure,
      statsFileName
    );
    return;
  }

  const fileNames = positionals;
  await runRecipes(context, fileNames, inventoryPath, hostname, throwOnRecipeFailure, statsFileName, runner);
}

const runTestSuiteArgsConfig: ParseArgsConfig = {
  allowPositionals: true,
  strict: true,
  options: { ...parseArgsLogOptions },
};

async function runTestSuite(args: string[]) {
  const { positionals, values } = parseArgs({
    ...runTestSuiteArgsConfig,
    args,
  });

  const { ...otherArgs } = Joi.attempt(values, joiParseArgsLogOptionsSchema, 'Error evaluating command args:');
  const logger = newLoggerFromParseArgs(otherArgs);
  setupUncaughtHandler(logger);
  const context: ContextLogger = { logger };

  const testSuites: TestSuite[] = [];

  for (const fileName of positionals) {
    const config = await loadYAMLFromFile(fileName);
    const testSuite = new TestSuite(config, { fileName });
    testSuites.push(testSuite);
  }

  for (const testSuite of testSuites) {
    try {
      const result = await testSuite.run(context);
      logger.info('Test suite finished', {
        fileName: testSuite.meta?.fileName,
        result,
      });
      TestSuite.printTestSuiteResult(result);
    } catch (ex) {
      logger.error('Failed to run test suite', {
        fileName: testSuite.meta?.fileName,
        ex,
      });
    }
  }
}

async function runRecipes(
  context: RecipeCtorContext & Partial<MyPartialRunContextOmit>,
  fileNames: string[],
  inventoryPath: string,
  hostname: string,
  throwOnRecipeFailure: boolean,
  statsFileName?: string,
  runnerConfig?: RegistryEntryGenericConfig
) {
  const runner = runnerConfig
    ? runnerRegistry.getRegistryEntryInstanceFromIndexedConfig<AbstractRunnerInstance>(runnerConfig, TestRunnerSchema)
    : undefined;

  const recipes: Recipe[] = [];
  for (const filePath of fileNames) {
    recipes.push(await Recipe.fromPath(context, filePath));
  }

  const archiveDir = await fsPromiseTmpDir({});
  const archive = await Archive.create(context, {
    archiveDir,
    recipes,
  });

  const recipesStats: Record<string, RunStatistics> = {};

  if (runner != null) {
    const archiveFile = await fsPromiseTmpFile({
      keep: false,
      discardDescriptor: true,
      postfix: '.tar.gz',
    });
    await archive.saveToTarArchive(archiveFile);
    await runner.setUp(context);
    try {
      const archiveDir = await runner.uploadAndExtractTarGZArchive(context, archiveFile);
      const recipeIds = recipes.map((r) => r.fullId!);
      context.logger.info('Running recipes in runner', { recipeIds });
      const runResult = await runner.runRecipes(
        {
          ...context,
          testingMode: true,
        },
        archiveDir,
        recipeIds
      );
      context.logger.info('Finished running recipes in runner', {
        recipeIds,
        runResult,
      });
      for (const recipeId in runResult.statistics) {
        recipesStats[recipeId] = runResult.statistics[recipeId];
      }
    } catch (ex) {
      handleRunError(context, ex, throwOnRecipeFailure);
    } finally {
      await runner.tearDown(context).catch((ex) => context.logger.error('Failed to teardown runner', { error: ex }));
      statsFileName && (await fsPromiseWriteFile(statsFileName, JSON.stringify(recipesStats)));
    }
    return;
  }

  for (const recipe of recipes) {
    const statistics = newRunStatistics();
    const inventory = inventoryPath ? await Inventory.fromFile(context, inventoryPath) : new Inventory({});

    try {
      await runRecipe(context, {
        inventory,
        recipe,
        hostname,
        runContextPartial: { statistics },
      });
    } catch (ex) {
      handleRunError(context, ex, throwOnRecipeFailure);
      break;
    } finally {
      statistics.endTime = new Date().getTime();
      recipesStats[recipe.fullId!] = statistics;
    }
  }

  statsFileName && (await fsPromiseWriteFile(statsFileName, JSON.stringify(recipesStats)));
}

async function runRecipeFromArchive(
  context: RecipeCtorContext & Partial<MyPartialRunContextOmit>,
  recipeIds: string[],
  archiveDir: string,
  inventoryPath: string,
  hostname: string,
  throwOnRecipeFailure: boolean,
  statsFileName?: string
) {
  const recipesStats = await runRecipesFromArchive(context, {
    archiveDir,
    inventoryPath,
    hostname,
    recipeIds,
    throwOnRecipeFailure,
  });
  statsFileName && (await fsPromiseWriteFile(statsFileName, JSON.stringify(recipesStats)));
  return;
}

function getRecipeSourcesFromSourceArg(recipeSourceCtorContext: RecipeSourceCtorContext, source: string[]) {
  const recipeSources =
    source.length > 0
      ? new RecipeSourceList(
          recipeSourceCtorContext,
          source.map((c) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return shortieToObject(c) as any;
          })
        )
      : undefined;
  return recipeSources;
}

function handleRunError(context: RecipeCtorContext, ex: unknown, throwOnRecipeFailure: boolean) {
  if (!throwOnRecipeFailure) {
    if (ex instanceof Error) {
      context.logger.error('Execution failed', { cause: getErrorCauseChain(ex) });
      return;
    }

    context.logger.error('Execution failed', { error: ex });
    return;
  }

  throw ex;
}

void main();
