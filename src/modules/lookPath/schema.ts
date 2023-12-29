/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';

export const ModuleLookPathSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.alternatives([
    Joi.string(),
    Joi.object({
      cmd: Joi.string().required(),
      include: Joi.array().items(Joi.string()),
      exclude: Joi.array().items(Joi.string()),
    }),
  ])
);
