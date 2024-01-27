/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { setupUncaughtHandler } from '../../src/util/uncaught';
import { joiParseArgsLogOptionsSchema, newLoggerFromParseArgs, parseArgsLogOptions } from '../../src/util/logger';
import type { ParseArgsConfig } from 'node:util';
import { parseArgs } from 'node:util';
import { checkVersionCommand } from '../../src/util/args';
import { joiAttemptRequired, joiValidateSyncFSExists } from '../../src/util/joi';
import Joi from 'joi';
import { loadYAMLFromFile } from '../../src/util/yaml';
import { CmdCIGenArtifactsMatrixConfigSchema } from '../../src/ci/ciGenArtifactsMatrix.schema';
import type { CmdCIGenArtifactsMatrixConfigInterface } from '../../src/ci/ciGenArtifactsMatrix.schema.gen';
import { setOutput } from '@actions/core';
import { createNodeJSBundle } from '../../src/commands/createNodeJSBundle';
import type { NodeJSExecutableArch, NodeJSExecutablePlatform } from '../../src/util/downloadNodeDist';

import type { ContextLogger } from '../../src/util/context';

const argsConfig: ParseArgsConfig = {
  allowPositionals: false,
  strict: true,
  options: {
    ...parseArgsLogOptions,

    configFile: { type: 'string' },
    run: { type: 'boolean' },
    outDir: { type: 'string' },
  },
};

async function main() {
  checkVersionCommand();

  const { values } = parseArgs(argsConfig);
  const { configFile, run, outDir, ...otherArgs } = joiAttemptRequired(
    values,
    joiParseArgsLogOptionsSchema.append({
      configFile: Joi.string().custom(joiValidateSyncFSExists).required(),
      run: Joi.boolean(),
      outDir: Joi.string().custom(joiValidateSyncFSExists).when('run', {
        is: true,
        then: Joi.required(),
      }),
    }),
    'Error evaluating command args:'
  );
  const logger = newLoggerFromParseArgs(otherArgs);
  setupUncaughtHandler(logger);
  const context: ContextLogger = { logger };

  const config = Joi.attempt(
    await loadYAMLFromFile(configFile),
    CmdCIGenArtifactsMatrixConfigSchema
  ) as CmdCIGenArtifactsMatrixConfigInterface;

  const outEntries: {
    package: string;
    entryPoint: string;
    platform: string;
    arch: string;
  }[] = [];

  for (const packageKey in config.packages) {
    const { entryPoint, variants } = config.packages[packageKey];
    for (const { platform, arch } of variants) {
      for (const archEntry of arch) {
        outEntries.push({
          package: packageKey,
          entryPoint,
          platform,
          arch: archEntry,
        });
      }
    }
  }

  logger.info('Generated entries', { outEntries });
  setOutput('matrix', JSON.stringify({ include: outEntries }));

  if (run) {
    for (const { entryPoint, platform, arch } of outEntries) {
      await createNodeJSBundle(context, {
        outDir,
        entryPoint,
        nodeArch: arch as NodeJSExecutableArch,
        nodePlatform: platform as NodeJSExecutablePlatform,
      });
    }
  }
}

void main();
