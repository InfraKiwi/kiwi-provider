import { newDebug } from '../src/util/debug';
import type { ParseArgsConfig } from 'node:util';
import { parseArgs } from 'node:util';
import Joi from 'joi';
import { joiParseArgsLogOptionsSchema, newLoggerFromParseArgs, parseArgsLogOptions } from '../src/util/logger';
import { checkVersionCommand, getArgDefault } from '../src/util/args';
import * as os from 'node:os';
import { runRecipeFromFile } from '../src/commands/runRecipeFromFile';
import '../src/util/loadAllRegistryEntries.gen';
import { joiAttemptAsync, joiValidateAsyncFileExists } from '../src/util/joi';
import type { RecipeSourceCtorContext } from '../src/recipeSources/recipeSourceList';
import { RecipeSourceList } from '../src/recipeSources/recipeSourceList';
import type { RecipeCtorContext } from '../src/components/recipe';
import { setupUncaughtHandler } from '../src/util/uncaught';
import { shortieToObject } from '../src/util/shortie';
import { runRecipesFromArchive } from '../src/commands/runRecipeFromArchive';
import { getErrorCauseChain } from '../src/util/error';
import { fsPromiseWriteFile } from '../src/util/fs';
import type { MyPartialRunContextOmit, RunStatistics } from '../src/util/runContext';
import { newRunStatistics } from '../src/util/runContext';
import { TestSuite } from '../src/components/testSuite';
import { loadYAMLFromFile } from '../src/util/yaml';
import type { ContextLogger } from '../src/util/context';

const debug = newDebug(__filename);

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
    archiveDir: {
      type: 'string',
      short: 'a',
    },
    throwOnRecipeFailure: {
      type: 'boolean',
    },
    statsFileName: {
      type: 'string',
    },
    testingMode: {
      type: 'boolean',
    },
  },
};

enum MainCommand {
  runRecipeFromFile = 'runRecipeFromFile',
  runRecipesFromArchive = 'runRecipesFromArchive',
  test = 'test',
}

async function main() {
  checkVersionCommand();

  const args = process.argv.slice(2);
  const mainCommand = args[0] as MainCommand;
  const mainCommandArgs = args.slice(1);

  switch (mainCommand) {
    case MainCommand.runRecipeFromFile:
      break;
    case MainCommand.runRecipesFromArchive:
      break;
    case MainCommand.test:
      return runTestSuite(mainCommandArgs);
    default:
      throw new Error(`Invalid command ${mainCommand}. Supported: ${Object.values(MainCommand)}`);
  }
  const isArchive = mainCommand == 'runRecipesFromArchive';

  let argsValidation = joiParseArgsLogOptionsSchema.append({
    hostname: Joi.string().default(getArgDefault(argsConfig, 'hostname')),
    inventoryPath: Joi.string(),
    source: Joi.array().items(Joi.string()).default([]),
    throwOnRecipeFailure: Joi.boolean().default(false),
    statsFileName: Joi.string(),
    testingMode: Joi.boolean().default(false),
  });

  if (isArchive) {
    argsValidation = argsValidation.append({
      archiveDir: Joi.string().external(joiValidateAsyncFileExists).required(),
    });
  }

  const { positionals, values } = parseArgs({ ...argsConfig, args: mainCommandArgs });
  const {
    hostname,
    inventoryPath,
    source,
    archiveDir,
    throwOnRecipeFailure,
    statsFileName,
    testingMode,
    ...otherArgs
  } = await joiAttemptAsync(values, argsValidation, 'Error evaluating command args:');
  const logger = newLoggerFromParseArgs(otherArgs);
  setupUncaughtHandler(logger);

  const recipeSourceCtorContext: RecipeSourceCtorContext = {
    logger,
    workDir: process.cwd(),
  };

  const recipeSources =
    (source as string[]).length > 0
      ? new RecipeSourceList(
          recipeSourceCtorContext,
          (source as string[]).map((c) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return shortieToObject(c) as any;
          }),
        )
      : undefined;

  const context: RecipeCtorContext & Partial<MyPartialRunContextOmit> = {
    ...recipeSourceCtorContext,
    recipeSources,
    isTesting: testingMode,
  };

  if (isArchive) {
    const recipesStats = await runRecipesFromArchive(context, {
      archiveDir,
      inventoryPath,
      hostname,
      recipeIds: positionals,
      throwOnRecipeFailure,
    });
    statsFileName && (await fsPromiseWriteFile(statsFileName, JSON.stringify(recipesStats)));
    return;
  }

  const recipesStats: Record<string, RunStatistics> = {};
  for (const filePath of positionals) {
    if (filePath == null) {
      throw new Error(`Missing required file name or recipe id`);
    }
    const statistics = newRunStatistics();
    try {
      await runRecipeFromFile(
        {
          ...context,
          statistics,
        },
        {
          recipePath: filePath,
          inventoryPath,
          hostname,
        },
      );
    } catch (ex) {
      handleRunError(context, ex, throwOnRecipeFailure);
      break;
    } finally {
      statistics.endTime = new Date().getTime();
      recipesStats[filePath] = statistics;
    }
  }

  statsFileName && (await fsPromiseWriteFile(statsFileName, JSON.stringify(recipesStats)));
}

const runTestSuiteArgsConfig: ParseArgsConfig = {
  allowPositionals: true,
  strict: true,
  options: {
    ...parseArgsLogOptions,
  },
};

async function runTestSuite(args: string[]) {
  const { positionals, values } = parseArgs({
    ...runTestSuiteArgsConfig,
    args,
  });

  const { ...otherArgs } = await joiAttemptAsync(
    values,
    joiParseArgsLogOptionsSchema,
    'Error evaluating command args:',
  );
  const logger = newLoggerFromParseArgs(otherArgs);
  setupUncaughtHandler(logger);
  const context: ContextLogger = { logger };

  const testSuites: TestSuite[] = [];

  for (const fileName of positionals) {
    const config = await loadYAMLFromFile(fileName);
    const testSuite = new TestSuite(config, {
      fileName,
    });
    testSuites.push(testSuite);
  }

  for (const testSuite of testSuites) {
    try {
      const result = await testSuite.run(context);
      logger.info(`Test suite finished`, { fileName: testSuite.meta?.fileName, result });
      TestSuite.printTestSuiteResult(result);
    } catch (ex) {
      logger.error(`Failed to run test suite`, { fileName: testSuite.meta?.fileName, ex });
    }
  }
}

function handleRunError(context: RecipeCtorContext, ex: unknown, throwOnRecipeFailure: boolean) {
  if (!throwOnRecipeFailure) {
    if (ex instanceof Error) {
      context.logger.error(`Execution failed`, { cause: getErrorCauseChain(ex) });
      return;
    }

    context.logger.error(`Execution failed`, { error: ex });
    return;
  }

  throw ex;
}

void main();
