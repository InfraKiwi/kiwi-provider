/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';

export const ModuleDebuggerSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.alternatives([
    Joi.object({}),
    Joi.object({
      enable: Joi.boolean().valid(true).required().description(`
    Set to true to enable the nodejs inspector.
  `),
    }),
  ])
);
