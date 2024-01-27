/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { joiMetaClassName } from '../util/joi';
import { ModuleRunResultSchema } from '../modules/abstractModuleBase.schema';
import { joiValidateValidIfTemplate } from '../util/tpl';

export const ConditionSchema = Joi.string().custom(joiValidateValidIfTemplate);

export const ConditionSetSchema = Joi.alternatives([ConditionSchema, Joi.array().items(ConditionSchema)]).meta(
  joiMetaClassName('ConditionSetInterface')
);

export const TestMockBaseSchema = Joi.object({ result: ModuleRunResultSchema.required() }).meta(
  joiMetaClassName('TestMockBaseInterface')
);
