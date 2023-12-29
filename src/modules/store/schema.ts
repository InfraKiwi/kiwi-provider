/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';

const ModuleStoreSchemaBase = Joi.object({
  path: Joi.string().required(),
  workDir: Joi.string(),
});

export const ModuleStoreSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.alternatives([
    ModuleStoreSchemaBase.append({
      content: Joi.string().required(),
      // If true, do not auto-convert the contents to fit the file type
      raw: Joi.boolean(),
    }),
    ModuleStoreSchemaBase.append({
      content: Joi.any().required(),
      // If the content type is not a string, then it needs to be forcefully stringified
      raw: Joi.boolean().valid(false),
    }),
  ])
);
