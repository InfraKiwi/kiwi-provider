/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { hostSourceRegistryEntryFactory } from '../registry';
import { MultiDataSourceHTTPListArgsSchema } from '../../dataSources/httpList/schema';

export const HostSourceHTTPSchema = hostSourceRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  MultiDataSourceHTTPListArgsSchema,
  { name: 'HostSourceHTTPInterface' }
);
