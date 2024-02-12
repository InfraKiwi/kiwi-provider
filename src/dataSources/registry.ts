/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { Registry, RegistryEntryFactory } from '../util/registry';
import path from 'node:path';

export const dataSourceRegistry = new Registry(path.basename(__dirname));

export const dataSourceRegistryEntryFactory = new RegistryEntryFactory({
  typeName: 'DataSource',
  baseDir: __dirname,
  registry: dataSourceRegistry,
});

export const multiDataSourceRegistryEntryFactory = new RegistryEntryFactory({
  typeName: 'MultiDataSource',
  baseDir: __dirname,
  registry: dataSourceRegistry,
});
