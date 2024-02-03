/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { cliContextLoggerFromArgs, joiParseArgsLogOptionsSchema, parseArgsLogOptions } from '../../src/util/logger';
import type { ParseArgsConfig } from 'node:util';
import { parseArgs } from 'node:util';
import { joiAttemptRequired } from '../../src/util/joi';
import Joi from 'joi';
import { setOutput } from '@actions/core';

import { getBuildVersion } from '../../src/util/package';
import { fsPromiseMkdir, fsPromiseWriteFile } from '../../src/util/fs';
import path from 'node:path';

const argsConfig: ParseArgsConfig = {
  allowPositionals: false,
  strict: true,
  options: {
    ...parseArgsLogOptions,
    outFile: { type: 'string' },
  },
};

// NOTE: BUILD_VERSION_METHOD

async function main() {
  const { values } = parseArgs(argsConfig);
  const { outFile, ...otherArgs } = joiAttemptRequired(
    values,
    joiParseArgsLogOptionsSchema.append({
      outFile: Joi.string().required(),
    }),
    'Error evaluating command args:'
  );
  const context = cliContextLoggerFromArgs(otherArgs);

  const version = await getBuildVersion(context);

  await fsPromiseMkdir(path.dirname(outFile), { recursive: true });
  await fsPromiseWriteFile(outFile, version);

  setOutput('version', version);
}

void main();
