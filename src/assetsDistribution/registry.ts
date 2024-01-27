/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { Registry, RegistryEntryFactory } from '../util/registry';
import path from 'node:path';

export const assetsDistributionRegistry = new Registry(path.basename(__dirname));
export const assetsDistributionRegistryEntryFactory = new RegistryEntryFactory({
  typeName: 'AssetsDistribution',
  baseDir: __dirname,
  registry: assetsDistributionRegistry,
});
