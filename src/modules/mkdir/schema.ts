/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';

export const ModuleMkdirSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    path: Joi.string().required().description(`
      The path of the folder to create.
    `),
    recursive: Joi.boolean().default(true).optional().description(`
      Whether or not to create the whole chain of missing folders needed to 
      reach the final part of the path.
      
      @default true
    `),
  })
);
