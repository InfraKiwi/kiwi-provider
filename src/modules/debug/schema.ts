/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';

export const ModuleDebugSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.any().description('Any value type is acceptable, as it will be encoded and printed to the console')
);
