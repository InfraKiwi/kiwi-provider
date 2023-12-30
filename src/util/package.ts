/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { fsPromiseReadFile } from './fs';
import path from 'node:path';
import { isPartOfESBuildBundle, version10InfraConfig, versionESBuild } from './build';

export async function getPackageVersion(): Promise<string> {
  if (isPartOfESBuildBundle) {
    return version10InfraConfig;
  }

  const packageInfo = JSON.parse(await fsPromiseReadFile(path.join(__dirname, '..', '..', 'package.json'), 'utf-8'));
  return packageInfo.version;
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
