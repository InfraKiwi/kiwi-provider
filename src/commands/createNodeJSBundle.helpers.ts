/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { NodeJSExecutableArch } from '../util/downloadNodeDist';
import { NodeJSExecutablePlatform } from '../util/downloadNodeDist';
import { getBuildVersion } from '../util/package';
import type { ContextLogger } from '../util/context';

export async function getNodeJSBundleFileName(
  context: ContextLogger,
  entryPointName: string,
  nodePlatform: NodeJSExecutablePlatform,
  nodeArch: NodeJSExecutableArch
) {
  const bundleFileName = [entryPointName, nodePlatform, nodeArch, await getBuildVersion(context)].join('-');
  return bundleFileName + (nodePlatform == NodeJSExecutablePlatform.win ? '.exe' : '');
}
