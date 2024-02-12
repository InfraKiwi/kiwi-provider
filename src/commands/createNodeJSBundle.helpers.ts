/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { NodeJSExecutableArch } from '../util/downloadNodeDist';
import { NodeJSExecutablePlatform } from '../util/downloadNodeDist';
import type { GetBuildVersionArgs } from '../util/package';
import { getBuildVersion } from '../util/package';
import type { ContextLogger } from '../util/context';
import { CommandCreateNodeJSBundleFormat } from './createNodeJSBundle.schema';

export async function getNodeJSBundleFileName(
  context: ContextLogger,
  entryPointName: string,
  nodePlatform: NodeJSExecutablePlatform,
  nodeArch: NodeJSExecutableArch,
  format: CommandCreateNodeJSBundleFormat,
  buildVersionArgs?: GetBuildVersionArgs
) {
  const bundleFileName = [
    entryPointName,
    nodePlatform,
    nodeArch,
    await getBuildVersion(context, buildVersionArgs),
  ].join('-');
  let extension = '';
  if (nodePlatform == NodeJSExecutablePlatform.win) {
    extension = '.exe';
  }
  switch (format) {
    case CommandCreateNodeJSBundleFormat.gz:
      extension += '.gz';
      break;
  }
  return bundleFileName + extension;
}
