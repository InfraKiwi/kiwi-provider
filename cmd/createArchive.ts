/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { ParseArgsConfig } from 'node:util';
import { parseArgs } from 'node:util';
import Joi from 'joi';
import { glob } from 'glob';
import { joiParseArgsLogOptionsSchema, newLoggerFromParseArgs, parseArgsLogOptions } from '../src/util/logger';
import { shortieToObject } from '../src/util/shortie';
import { RecipeSourceList } from '../src/recipeSources/recipeSourceList';
import { createArchiveFile } from '../src/commands/createArchiveFile';
import type { ContextLogger, ContextWorkDir } from '../src/util/context';
import { fsPromiseMkdir, fsPromiseRm } from '../src/util/fs';
import { setupUncaughtHandler } from '../src/util/uncaught';
import { joiAttemptRequired } from '../src/util/joi';

/*
 *This program should generate an archive of recipes that each host can download.
 */
const argsConfig: ParseArgsConfig = {
  allowPositionals: true,
  strict: true,
  options: {
    ...parseArgsLogOptions,

    source: {
      type: 'string',
      short: 's',
      multiple: true,
    },
    outputTarFile: {
      type: 'string',
      short: 'o',
    },
    archiveDir: {
      type: 'string',
      short: 'a',
    },
    dump: {
      type: 'string',
      short: 'd',
    },
  },
};

async function main() {
  const { positionals, values } = parseArgs(argsConfig);

  const { source, outputTarFile, archiveDir, dump, ...otherArgs } = joiAttemptRequired(
    values,
    joiParseArgsLogOptionsSchema.append({
      source: Joi.array().items(Joi.string()).default([]),
      outputTarFile: Joi.string(),
      dump: Joi.string(),
      archiveDir: Joi.string(),
    }),
    'Error evaluating command args:'
  );
  const logger = newLoggerFromParseArgs(otherArgs);
  setupUncaughtHandler(logger);

  if (archiveDir) {
    await fsPromiseRm(archiveDir, {
      recursive: true,
      force: true,
    });
    await fsPromiseMkdir(archiveDir);
  }

  const recipeGlob: string[] = joiAttemptRequired(positionals, Joi.array<string[]>().items(Joi.string()).min(1));

  const recipesPaths = await glob(recipeGlob);
  const context: ContextLogger & ContextWorkDir = {
    logger,
    workDir: process.cwd(),
  };

  const recipeSources =
    (source as string[]).length > 0
      ? new RecipeSourceList(
          context,
          (source as string[]).map((c) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return shortieToObject(c) as any;
          })
        )
      : undefined;

  await createArchiveFile(context, {
    archiveDir,
    recipesPaths,
    recipeSources,
    archiveTarFilename: outputTarFile,
    configDumpFilename: dump,
  });
}

void main();
