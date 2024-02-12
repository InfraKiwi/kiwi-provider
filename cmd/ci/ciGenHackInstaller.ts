/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { cliContextLoggerFromArgs, joiParseArgsLogOptionsSchema, parseArgsLogOptions } from '../../src/util/logger';
import type { ParseArgsConfig } from 'node:util';
import { parseArgs } from 'node:util';
import { joiAttemptRequired } from '../../src/util/joi';
import Joi from 'joi';
import { loadYAMLFromFile } from '../../src/util/yaml';
import path from 'node:path';
import { ciRootDir } from './common';
import { CmdCIGenHackInstallerConfigSchema } from '../../src/ci/ciGenHackInstaller.schema';
import type { CmdCIGenHackInstallerConfigInterface } from '../../src/ci/ciGenHackInstaller.schema.gen';
import { fsPromiseMkdir, fsPromiseReadFile, fsPromiseWriteFile } from '../../src/util/fs';
import { asyncStringReplace } from '../../src/util/string';
import { extractAllTemplates, resolveTemplates } from '../../src/util/tpl';
import axios from 'axios';
import type { ContextLogger } from '../../src/util/context';

const argsConfig: ParseArgsConfig = {
  allowPositionals: false,
  strict: true,
  options: {
    ...parseArgsLogOptions,
    artifactsFile: {
      type: 'string',
      default: 'installers.yaml',
    },
    artifactsUrl: {
      type: 'string',
    },
  },
};

/**
 * Generates the installer scripts from their templates.
 */
async function main() {
  const { values } = parseArgs(argsConfig);
  const { artifactsUrl, artifactsFile, ...otherArgs } = joiAttemptRequired(
    values,
    joiParseArgsLogOptionsSchema.append({
      artifactsUrl: Joi.string().uri(),
      artifactsFile: Joi.string().required(),
    }),
    'Error evaluating command args:'
  );
  const context = cliContextLoggerFromArgs(otherArgs);

  await build(context, {
    artifactsUrl,
    artifactsFile,
  });
}

const hackInstallerDir = path.join(ciRootDir, 'hack', 'installers');

type ProcessSourceScriptGlobalOptions = Omit<CmdCIGenHackInstallerConfigInterface, 'scripts'>;
type ProcessSourceScriptOptions = Omit<CmdCIGenHackInstallerConfigInterface['scripts'][number], 'src' | 'dest'>;

interface TplContext {
  artifactsUrl?: string;
  artifactsLatestVersion?: string;
}

async function processSource(
  filePath: string,
  globalOptions: ProcessSourceScriptGlobalOptions,
  options: ProcessSourceScriptOptions,

  tplContext: TplContext
): Promise<string> {
  let content = await fsPromiseReadFile(filePath, 'utf-8');
  for (const header of globalOptions.headers ?? []) {
    if (content.startsWith(header)) {
      content = content.substring(header.length);
    }
  }

  if (options.template) {
    content = (await resolveTemplates(extractAllTemplates(content), tplContext)) as string;
  }

  /*
   * E.g. minify to a degree
   * content = content.replaceAll(/^\s*#(?!!).*$/gm, '');
   * content = content.replaceAll(/\n{2,}/gm, '\n');
   */
  return await asyncStringReplace(content, /^\. (['"])?(.+)\1$/gm, async (_g0, _g1, sourcePath) => {
    const replacePath = path.join(path.dirname(filePath), sourcePath);
    return await processSource(replacePath, globalOptions, options, tplContext);
  });
}

export interface genHackInstallerOptions {
  artifactsUrl?: string;
  artifactsFile: string;
}

export async function build(context: ContextLogger, options: genHackInstallerOptions) {
  context.logger.info('Generating installers', options);
  const artifactsFilePath = path.isAbsolute(options.artifactsFile)
    ? options.artifactsFile
    : path.join(hackInstallerDir, options.artifactsFile);
  const config = Joi.attempt(
    await loadYAMLFromFile(artifactsFilePath),
    CmdCIGenHackInstallerConfigSchema
  ) as CmdCIGenHackInstallerConfigInterface;

  const artifactsLatestVersion = options.artifactsUrl
    ? (
        await axios.get('/latest', {
          baseURL: options.artifactsUrl,
        })
      ).data
    : undefined;

  for (const script of config.scripts) {
    const src = path.join(hackInstallerDir, script.src);
    const dest = path.isAbsolute(script.dest) ? script.dest : path.join(ciRootDir, script.dest);
    context.logger.info('Generating script entry', {
      src,
      dest,
    });
    await fsPromiseMkdir(path.dirname(dest), { recursive: true });
    const content = await processSource(src, config, script, {
      artifactsUrl: options.artifactsUrl,
      artifactsLatestVersion,
    });
    await fsPromiseWriteFile(dest, content);
  }
}

if (require.main == module) {
  void main();
}
