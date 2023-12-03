// Creates the SEA package
// https://nodejs.org/docs/latest-v20.x/api/single-executable-applications.html

import path from 'node:path';
import { setupUncaughtHandler } from '../src/util/uncaught';
import { joiParseArgsLogOptionsSchema, newLoggerFromParseArgs, parseArgsLogOptions } from '../src/util/logger';
import type { ContextLogger } from '../src/util/context';
import { newDebug } from '../src/util/debug';
import type { ParseArgsConfig } from 'node:util';
import { parseArgs } from 'node:util';
import { checkVersionCommand } from '../src/util/args';
import { joiAttemptAsync, joiValidateAsyncFileExists } from '../src/util/joi';
import Joi from 'joi';
import { createNodeJSBundle } from '../src/commands/createNodeJSBundle';
import { getCurrentNodeJSArch, getCurrentNodeJSPlatform } from '../src/util/downloadNodeDist';

const debug = newDebug(__filename);

const argsConfig: ParseArgsConfig = {
  allowPositionals: false,
  strict: true,
  options: {
    ...parseArgsLogOptions,

    seaConfigFile: {
      type: 'string',
      short: 'c',
      default: path.join(__dirname, '..', 'sea-config.json'),
    },
    seaBlobFile: {
      type: 'string',
      short: 'f',
      default: path.join(__dirname, '..', 'dist', 'sea.blob'),
    },
  },
};

async function main() {
  checkVersionCommand();

  const { values } = parseArgs(argsConfig);
  const { seaConfigFile, seaBlobFile, ...otherArgs } = await joiAttemptAsync(
    values,
    joiParseArgsLogOptionsSchema.append({
      seaConfigFile: Joi.string().external(joiValidateAsyncFileExists).required(),
      seaBlobFile: Joi.string().required(),
    }),
    'Error evaluating command args:',
  );
  const logger = newLoggerFromParseArgs(otherArgs);
  setupUncaughtHandler(logger);
  const context: ContextLogger = {
    logger,
  };

  await createNodeJSBundle(context, {
    seaConfigFile,
    seaBlobFile,
    nodeArch: getCurrentNodeJSArch(),
    nodePlatform: getCurrentNodeJSPlatform(),
  });
}

void main();
