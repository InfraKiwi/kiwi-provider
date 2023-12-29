/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { moduleRegistryEntryFactory } from '../registry';
import { DataSourceHTTPRawSchema } from '../../dataSources/http/schema';

export const ModuleHTTPSchema = moduleRegistryEntryFactory.createJoiEntrySchema(__dirname, DataSourceHTTPRawSchema, {
  label: 'ModuleHTTPInterface',
});
