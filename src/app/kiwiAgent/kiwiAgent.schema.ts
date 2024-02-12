/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { joiMetaClassName } from '../../util/joi';
import { localhost127 } from '../../util/constants';
import { KiwiProviderListenerDefaultPort } from '../kiwiProvider/kiwiProvider.schema';
import { getAppConfigSchemaObject } from '../common/server';

export const AgentListenerDefaultPort = 13901;

export const AgentConfigSchema = Joi.object({
  hostname: Joi.string().description('The id/hostname of the current machine'),
  kiwiProviderUrl: Joi.string().default(`http://${localhost127}:${KiwiProviderListenerDefaultPort}`),
  databasePath: Joi.string().default('release.db.txt'),
}).meta(joiMetaClassName('AgentConfigInterface'));

export const AgentAppConfigSchema = getAppConfigSchemaObject(AgentConfigSchema, {
  port: AgentListenerDefaultPort,
}).meta(joiMetaClassName('AgentAppConfigInterface'));
