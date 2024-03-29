/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { cliContextLoggerFromArgs, joiParseArgsLogOptionsSchema, parseArgsLogOptions } from '../../src/util/logger';
import type { ParseArgsConfig } from 'node:util';
import { parseArgs } from 'node:util';
import { joiAttemptRequired, joiValidateSyncFSExists } from '../../src/util/joi';
import Joi from 'joi';
import { loadYAMLFromFile } from '../../src/util/yaml';
import { CmdCIGenArtifactsMatrixConfigSchema } from '../../src/ci/ciGenArtifactsMatrix.schema';
import type { CmdCIGenArtifactsMatrixConfigInterface } from '../../src/ci/ciGenArtifactsMatrix.schema.gen';
import { setOutput } from '@actions/core';
import { createNodeJSBundle } from '../../src/commands/createNodeJSBundle';
import type { NodeJSExecutableArch, NodeJSExecutablePlatform } from '../../src/util/downloadNodeDist';
import { CommandCreateNodeJSBundleFormat } from '../../src/commands/createNodeJSBundle.schema';

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

/*
 * Generates a matrix that can be used to create binary artifacts in GitHub.
 * Optionally also triggers the generation of binary artifacts, for local testing/development.
 *
 * To set the version: BUILD_VERSION_METHOD
 */

async function main() {
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
  const context = cliContextLoggerFromArgs(otherArgs);

  const config = Joi.attempt(
    await loadYAMLFromFile(configFile),
    CmdCIGenArtifactsMatrixConfigSchema
  ) as CmdCIGenArtifactsMatrixConfigInterface;

  const outEntries: {
    package: string;
    entryPoint: string;
    platform: string;
    format: keyof typeof CommandCreateNodeJSBundleFormat;
    arch: string;
  }[] = [];

  for (const packageKey in config.packages) {
    const { entryPoint, variants } = config.packages[packageKey];
    for (const { platform, arch, formats } of variants) {
      for (const archEntry of arch) {
        for (const format of formats ?? [CommandCreateNodeJSBundleFormat.raw]) {
          outEntries.push({
            package: packageKey,
            entryPoint,
            platform,
            arch: archEntry,
            format,
          });
        }
      }
    }
  }

  context.logger.info('Generated entries', {
    outEntries,
  });
  setOutput('matrix', JSON.stringify({ include: outEntries }));

  if (run) {
    for (const { entryPoint, platform, arch, format } of outEntries) {
      await createNodeJSBundle(context, {
        outDir,
        entryPoint,
        nodeArch: arch as NodeJSExecutableArch,
        nodePlatform: platform as NodeJSExecutablePlatform,
        format: format as CommandCreateNodeJSBundleFormat,
      });
    }
  }
}

void main();
