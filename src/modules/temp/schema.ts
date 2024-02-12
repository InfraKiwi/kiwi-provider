/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';

export const ModuleTempSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    prefix: Joi.string(),
    extension: Joi.string(),

    // If true, the temporary file will not be deleted on program exit
    keep: Joi.boolean().default(false).optional(),
  })
);

export const ModuleTempDirSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  'tempDir',
  Joi.object({
    prefix: Joi.string(),

    // If true, the temporary file will not be deleted on program exit
    keep: Joi.boolean().default(false).optional(),
  })
);
