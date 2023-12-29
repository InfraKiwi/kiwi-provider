/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { Registry, RegistryEntryFactory } from '../util/registry';
import path from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logsStorageRegistry = new Registry(path.basename(__dirname));
export const logsStorageRegistryEntryFactory = new RegistryEntryFactory({
  typeName: 'LogsStorage',
  baseDir: __dirname,
  registry: logsStorageRegistry,
});
