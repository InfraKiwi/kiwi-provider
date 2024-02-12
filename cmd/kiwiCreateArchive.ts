/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { ParseArgsConfig } from 'node:util';
import { parseArgs } from 'node:util';
import Joi from 'joi';
import { glob } from 'glob';
import { cliContextLoggerFromArgs, joiParseArgsLogOptions, parseArgsLogOptions } from '../src/util/logger';
import { shortieToObject } from '../src/util/shortie';
import { RecipeSourceList } from '../src/recipeSources/recipeSourceList';
import { createArchiveFile } from '../src/commands/createArchiveFile';
import type { ContextLogger, ContextWorkDir } from '../src/util/context';
import { fsPromiseMkdir, fsPromiseRm, fsPromiseTmpDir } from '../src/util/fs';
import { joiAttemptRequired } from '../src/util/joi';
import { getS3ClientFromJoiParseArgsS3Options, uploadDirToS3 } from '../src/util/s3';
import { joiParseArgsS3Options, parseArgsS3Options } from '../src/util/s3.schema';
import type { joiParseArgsS3OptionsInterface } from '../src/util/s3.schema.gen';
import path from 'node:path';
import { normalizePathToUnix } from '../src/util/path';
import { argvFrom2 } from '../src/util/args';

/* This program should generate an archive of recipes that each host can download. */
const argsConfig: ParseArgsConfig = {
  allowPositionals: true,
  strict: true,
  options: {
    ...parseArgsLogOptions,
    ...parseArgsS3Options,

    recipeSource: {
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
    workDir: {
      type: 'string',
    },
  },
};

export async function mainKiwiCreateArchive(args = argvFrom2()) {
  const { positionals, values } = parseArgs({
    ...argsConfig,
    args,
  });

  const { recipeSource, outputTarFile, archiveDir, dump, workDir, ...otherArgs } = joiAttemptRequired(
    values,

    Joi.object({})
      .append(joiParseArgsLogOptions)
      .append(joiParseArgsS3Options)
      .append({
        recipeSource: Joi.array().items(Joi.string()).default([]),
        outputTarFile: Joi.string(),
        dump: Joi.string(),
        archiveDir: Joi.string(),
        workDir: Joi.string(),
      }),
    'Error evaluating command args:'
  );
  const context: ContextLogger & ContextWorkDir = {
    ...cliContextLoggerFromArgs(otherArgs),
    workDir: workDir ?? process.cwd(),
  };

  const s3Options = otherArgs as joiParseArgsS3OptionsInterface;
  const s3Client = await getS3ClientFromJoiParseArgsS3Options(s3Options, true);

  if (archiveDir) {
    await fsPromiseRm(archiveDir, {
      recursive: true,
      force: true,
    });
    await fsPromiseMkdir(archiveDir);
  }

  const realArchiveDir = archiveDir ?? (await fsPromiseTmpDir({ keep: true }));

  const recipeGlob: string[] = joiAttemptRequired(positionals, Joi.array<string[]>().items(Joi.string()).min(1)).map(
    normalizePathToUnix
  );

  const recipesPaths = await glob(recipeGlob, {
    cwd: context.workDir,
  });

  const recipeSources =
    (recipeSource as string[]).length > 0
      ? new RecipeSourceList(
          context,
          (recipeSource as string[]).map((c) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return shortieToObject(c) as any;
          })
        )
      : undefined;

  const archive = await createArchiveFile(context, {
    archiveDir: realArchiveDir,
    recipesPaths,
    recipeSources,
    archiveTarFilename: outputTarFile,
    configDumpFilename: dump,
  });

  if (s3Client) {
    const archiveVersion = `${archive.config.timestamp}`;
    const prefix = s3Options.s3Prefix ? path.join(s3Options.s3Prefix, archiveVersion) : archiveVersion;
    await uploadDirToS3(context, realArchiveDir, s3Client, s3Options.s3Bucket!, prefix);
  }

  return archive;
}

if (require.main == module) {
  void mainKiwiCreateArchive();
}
