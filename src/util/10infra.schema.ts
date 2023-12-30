/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { joiMetaClassName } from './joi';

export const TenInfraInfoSchema = Joi.object({
  appName: Joi.string().required().description(`
    The name of the running 10infra app.
  `),

  configPath: Joi.string().description(`
    The path of the config file used at the start of the app, if any was defined.
  `),
}).meta(joiMetaClassName('TenInfraInfoInterface')).description(`
An object containing some information about the current 10infra program.
`);
