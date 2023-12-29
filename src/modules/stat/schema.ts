/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';
import { joiMetaClassName } from '../../util/joi';

export const ModuleStatFullSchema = Joi.object({
  path: Joi.string().required(),
  // If true, follow symlinks
  follow: Joi.boolean().default(false).optional(),
  // If true, throw if the path does not exist
  throw: Joi.boolean().default(false).optional(),
}).meta(joiMetaClassName('ModuleStatFullInterface'));

export const ModuleStatSchema = moduleRegistryEntryFactory.createJoiEntrySchema(__dirname, ModuleStatFullSchema);
