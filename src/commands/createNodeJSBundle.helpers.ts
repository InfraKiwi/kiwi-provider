import type { NodeJSExecutableArch } from '../util/downloadNodeDist';
import { NodeJSExecutablePlatform } from '../util/downloadNodeDist';
import { getPackageVersion } from '../util/package';

export async function getNodeJSBundleFileName(
  entryPointName: string,
  nodePlatform: NodeJSExecutablePlatform,
  nodeArch: NodeJSExecutableArch,
) {
  const bundleFileName = [entryPointName, nodePlatform, nodeArch, await getPackageVersion()].join('-');
  return bundleFileName + (nodePlatform == NodeJSExecutablePlatform.win ? '.exe' : '');
}
