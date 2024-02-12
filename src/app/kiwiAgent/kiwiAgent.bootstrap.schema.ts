/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { joiMetaClassName } from '../../util/joi';

export const AgentBootstrapConfigParseArgsOptions: ParseArgsOptionsConfig = {
  url: { type: 'string' },
  installDir: { type: 'string' },
  force: { type: 'boolean' },
};

export const AgentBootstrapConfigSchema = Joi.object({
  url: Joi.string().uri().required(),
  installDir: Joi.string().required(),
  force: Joi.boolean().description('If true, forcefully overwrite any existing kiwiAgent config.'),
}).meta(joiMetaClassName('AgentBootstrapConfigInterface'));
