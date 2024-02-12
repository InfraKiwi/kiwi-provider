/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

/*
 * Creates the SEA package
 * https://nodejs.org/docs/latest-v20.x/api/single-executable-applications.html
 */

import type { NodeJSExecutableArch, NodeJSExecutablePlatform } from '../util/downloadNodeDist';
import type { ContextLogger } from '../util/context';

export enum CommandCreateNodeJSBundleFormat {
  raw = 'raw',
  gz = 'gz',
}

export interface CommandCreateNodeJSBundleArgs {
  outDir?: string;
  bundleFileName?: string;
  entryPoint: string;
  nodePlatform: NodeJSExecutablePlatform;
  nodeArch: NodeJSExecutableArch;
  format: CommandCreateNodeJSBundleFormat;
}

export type fnSignatureCreateNodeJSBundle = (
  context: ContextLogger,
  args: CommandCreateNodeJSBundleArgs
) => Promise<string>;
