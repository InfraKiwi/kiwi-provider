/*
 * Creates the SEA package
 * https://nodejs.org/docs/latest-v20.x/api/single-executable-applications.html
 */

import { setupUncaughtHandler } from '../src/util/uncaught';
import { joiParseArgsLogOptionsSchema, newLoggerFromParseArgs, parseArgsLogOptions } from '../src/util/logger';
import type { ContextLogger } from '../src/util/context';
import type { ParseArgsConfig } from 'node:util';
import { parseArgs } from 'node:util';
import { checkVersionCommand } from '../src/util/args';
import { getJoiEnumValues, joiValidateSyncFSExists } from '../src/util/joi';
import Joi from 'joi';
import { createNodeJSBundle } from '../src/commands/createNodeJSBundle';
import {
  getCurrentNodeJSArch,
  getCurrentNodeJSPlatform,
  NodeJSExecutableArch,
  NodeJSExecutablePlatform,
} from '../src/util/downloadNodeDist';

const argsConfig: ParseArgsConfig = {
  allowPositionals: false,
  strict: true,
  options: {
    ...parseArgsLogOptions,

    nodeArch: { type: 'string' },
    nodePlatform: { type: 'string' },
    outDir: { type: 'string' },
    entryPoint: { type: 'string' },
  },
};

async function main() {
  checkVersionCommand();

  const { values } = parseArgs(argsConfig);
  const { nodeArch, nodePlatform, outDir, entryPoint, ...otherArgs } = Joi.attempt(
    values,
    joiParseArgsLogOptionsSchema.append({
      nodeArch: getJoiEnumValues(NodeJSExecutableArch),
      nodePlatform: getJoiEnumValues(NodeJSExecutablePlatform),
      outDir: Joi.string().custom(joiValidateSyncFSExists).required(),
      entryPoint: Joi.string().custom(joiValidateSyncFSExists).required(),
    }),
    'Error evaluating command args:',
  );
  const logger = newLoggerFromParseArgs(otherArgs);
  setupUncaughtHandler(logger);
  const context: ContextLogger = { logger };

  await createNodeJSBundle(context, {
    outDir,
    entryPoint,
    nodeArch: nodeArch ?? getCurrentNodeJSArch(),
    nodePlatform: nodePlatform ?? getCurrentNodeJSPlatform(),
  });
}

void main();
