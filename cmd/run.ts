import { newDebug } from '../src/util/debug';
import type { ParseArgsConfig } from 'node:util';
import { parseArgs } from 'node:util';
import Joi from 'joi';
import { newLogger, setGlobalLogLevel } from '../src/util/logger';
import { getArgDefault } from '../src/util/args';
import * as os from 'node:os';
import { runRecipe } from '../src/commands/runRecipe';
import { runTestFile } from '../src/commands/runTestFile';
import '../src/util/loadAllRegistryEntries.gen';
import { parseArgsBaseJoiObject, parseArgsBaseOptions } from '../src/util/parseArgs';
import { joiAttemptAsync } from '../src/util/joi';
import type { RecipeSourceCtorContext } from '../src/recipeSources/recipeSourceList';
import { RecipeSourceList } from '../src/recipeSources/recipeSourceList';
import type { RecipeCtorContext } from '../src/components/recipe';
import { setupUncaughtHandler } from '../src/util/uncaught';
import { shortieToObject } from '../src/util/shortie';

const logger = newLogger();
setupUncaughtHandler(logger);

const debug = newDebug(__filename);

const argsConfig: ParseArgsConfig = {
  allowPositionals: true,
  strict: true,
  options: {
    ...parseArgsBaseOptions,

    hostname: {
      type: 'string',
      short: 'h',
      default: os.hostname(),
    },
    inventoryPath: {
      type: 'string',
      short: 'i',
    },
    test: {
      type: 'boolean',
      short: 't',
      default: false,
    },
    source: {
      type: 'string',
      short: 's',
      multiple: true,
    },
  },
};

async function main() {
  const { positionals, values } = parseArgs(argsConfig);

  const { logLevel, hostname, inventoryPath, test, source } = await joiAttemptAsync(
    values,
    parseArgsBaseJoiObject.append({
      hostname: Joi.string().hostname().default(getArgDefault(argsConfig, 'hostname')),
      inventoryPath: Joi.string(),
      test: Joi.boolean().default(getArgDefault(argsConfig, 'test')),
      source: Joi.array().items(Joi.string()).default([]),
    }),
    'Error evaluating command args:',
  );
  setGlobalLogLevel(logLevel);

  const filePath = positionals[0];
  if (filePath == null) {
    throw new Error(`Missing required ${test ? 'test' : 'recipe'} file name or recipe id`);
  }

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

  const context: RecipeCtorContext = {
    ...recipeSourceCtorContext,
    recipeSources,
  };

  if (test) {
    await runTestFile(context, {
      testPath: filePath,
      inventoryPath,
    });
  } else {
    await runRecipe(context, {
      recipePath: filePath,
      inventoryPath,
      hostname,
    });
  }
}

void main(); // .catch(debug.uncaught);
