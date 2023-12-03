import Joi from 'joi';
import { joiMetaClassName, joiValidateValidIfTemplate } from '../util/joi';
import { ModuleRunResultSchema } from '../modules/abstractModuleBase.schema';

export const ConditionSchema = Joi.string().custom(joiValidateValidIfTemplate);

export const ConditionSetSchema = Joi.alternatives([ConditionSchema, Joi.array().items(ConditionSchema)]).meta(
  joiMetaClassName('ConditionSetInterface'),
);

export const TestMockBaseSchema = Joi.object({
  result: ModuleRunResultSchema.required(),
}).meta(joiMetaClassName('TestMockBaseInterface'));
