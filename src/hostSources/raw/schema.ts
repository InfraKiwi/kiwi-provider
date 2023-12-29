/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { hostSourceRegistryEntryFactory } from '../registry';
import { joiObjectWithPattern } from '../../util/joi';

import { VarsSchema } from '../../components/varsContainer.schema';

export const HostSourceRawSchema = hostSourceRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  joiObjectWithPattern(VarsSchema)
);
