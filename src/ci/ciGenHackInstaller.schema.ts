/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { joiMetaClassName } from '../util/joi';

export const CmdCIGenHackInstallerConfigSchema = Joi.object({
  scripts: Joi.array()
    .items(
      Joi.object({
        src: Joi.string().required(),
        dest: Joi.string().required(),
        template: Joi.boolean(),
      })
    )
    .required(),
  headers: Joi.array().items(Joi.string()),
}).meta(joiMetaClassName('CmdCIGenHackInstallerConfigInterface'));
