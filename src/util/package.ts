/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { fsPromiseReadFile } from './fs';
import path from 'node:path';
import { isPartOfESBuildBundle, version10InfraConfig } from './build';

export async function getPackageVersion(): Promise<string> {
  if (isPartOfESBuildBundle) {
    return version10InfraConfig;
  }

  const packageInfo = JSON.parse(await fsPromiseReadFile(path.join(__dirname, '..', '..', 'package.json'), 'utf-8'));
  return packageInfo.version;
}
