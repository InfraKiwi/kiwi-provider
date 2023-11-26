import Joi from 'joi';
import { joiMetaClassName, joiValidateValidIfTemplate } from '../util/joi';

const conditionSchema = Joi.alternatives([
  // Joi.object().regex(),
  Joi.string().custom(joiValidateValidIfTemplate),
]);

export const TestMockSchemaBase = Joi.object({
  result: Joi.object().unknown(true),
  changed: Joi.boolean().default(false).optional(),
}).meta(joiMetaClassName('TestMockBaseInterface'));

export const TestMockSchema = TestMockSchemaBase.pattern(
  Joi.string(),
  Joi.alternatives([conditionSchema, Joi.array().items(conditionSchema)]),
).meta(joiMetaClassName('TestMockInterface'));

export const TestSchema = Joi.object({
  recipe: Joi.string(),
  targets: Joi.array().items(Joi.string()),
  mocks: Joi.array().items(TestMockSchema),
}).meta({ className: 'TestInterface' });
