/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { fsPromiseReadFile } from './fs';
import path from 'node:path';
import { isPartOfESBuildBundle, versionKiwiProvider, versionESBuild } from './build';
import { execCmd } from './exec';
import type { ContextLogger } from './context';
import { joiAttemptRequired, joiValidateSyncFSExists } from './joi';
import Joi from 'joi';
import { createRequire } from 'node:module';

const requireOnDemand = createRequire(__filename);

export const BuildVersionMethodEnv = 'BUILD_VERSION_METHOD';
export const BuildVersionMethodEnvMethodVersionFile = 'BUILD_VERSION_VERSION_FILE';
export const BuildVersionMethodEnvMethodEnv = 'BUILD_VERSION_ENV';

export enum BuildVersionMethod {
  package = 'package',
  git = 'git',
  timestamp = 'timestamp',
  versionFile = 'versionFile',
  env = 'env',
  arg = 'arg',
}

export async function getBuildVersion(
  context: ContextLogger,
  method?: BuildVersionMethod,
  versionArg?: string
): Promise<string> {
  if (isPartOfESBuildBundle) {
    return versionKiwiProvider;
  }

  let version: string;
  method ??= (process.env[BuildVersionMethodEnv] as BuildVersionMethod) ?? BuildVersionMethod.package;

  if (versionArg != null && method != BuildVersionMethod.arg) {
    throw new Error(`Unexpected argument \`versionArg\` for build version method ${method}`);
  }

  switch (method) {
    case BuildVersionMethod.git:
      version = (await execCmd(context, 'git', ['rev-parse', '--short', 'HEAD'])).stdout.trim();
      break;
    case BuildVersionMethod.timestamp:
      version = new Date().getTime().toString();
      break;
    case BuildVersionMethod.versionFile:
      {
        const fileName = joiAttemptRequired(
          process.env[BuildVersionMethodEnvMethodVersionFile],
          Joi.string().custom(joiValidateSyncFSExists)
        );
        version = await fsPromiseReadFile(fileName, 'utf-8');
      }
      break;
    case BuildVersionMethod.env:
      version = process.env[BuildVersionMethodEnvMethodEnv]!;
      break;
    case BuildVersionMethod.package:
      version = (await getPackageJSON()).version;
      break;
    case BuildVersionMethod.arg:
      version = versionArg!;
      break;
    default:
      throw new Error(`Unsupported package version method: ${method}`);
  }
  if (version == null) {
    throw new Error(`Null version for method ${method}`);
  }
  return version;
}

export async function getPackageJSON() {
  return requireOnDemand(path.join(__dirname, '..', '..', 'package.json'));
}

export async function getESBuildVersion(): Promise<string> {
  if (isPartOfESBuildBundle) {
    return versionESBuild;
  }

  /*
   * Here, instead of getting the version straight from the installed package, we do it
   * in a way around to not trigger unnecessary dependencies import
   */

  const packageInfo = JSON.parse(
    await fsPromiseReadFile(path.join(__dirname, '..', '..', 'node_modules', 'esbuild', 'package.json'), 'utf-8')
  );
  return packageInfo.version;
}
