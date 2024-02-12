/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';
import { joiMetaClassName } from '../../util/joi';

export const ModuleExitFullSchema = Joi.object({ message: Joi.string() }).meta(
  joiMetaClassName('ModuleExitFullInterface')
);

export const ModuleExitSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.alternatives([Joi.string(), ModuleExitFullSchema])
);
