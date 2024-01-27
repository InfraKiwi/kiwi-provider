/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { hostSourceRegistryEntryFactory } from '../registry';
import { MultiDataSourceGlobBaseSchema } from '../../dataSources/glob/schema';

export const HostSourceGlobSchema = hostSourceRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  MultiDataSourceGlobBaseSchema
);
