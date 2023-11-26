import { newDebug } from '../../util/debug';
import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';
import { joiMetaClassName, joiObjectWithPattern, joiValidateValidIfTemplate } from '../../util/joi';

const debug = newDebug(__filename);

const ModuleTestSchemaCondition = Joi.string().custom(joiValidateValidIfTemplate);

export const ModuleTestAllConditionsSchema = Joi.alternatives([
  ModuleTestSchemaCondition,
  Joi.array().items(ModuleTestSchemaCondition),
  joiObjectWithPattern(ModuleTestSchemaCondition),
]).meta(joiMetaClassName('ModuleTestAllConditionsInterface'));

export const ModuleTestFullSchema = Joi.object({
  tests: ModuleTestAllConditionsSchema.required(),
  // If true, do not throw when a test fails
  silent: Joi.boolean().default(false).optional(),
}).meta(joiMetaClassName('ModuleTestFullInterface'));

export const ModuleTestSilentFullSchema = Joi.object({
  tests: ModuleTestAllConditionsSchema.required(),
  // NOTE: ALWAYS SILENT
}).meta(joiMetaClassName('ModuleTestSilentFullInterface'));

export const ModuleTestSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  ModuleTestAllConditionsSchema.try(ModuleTestFullSchema),
);

export const ModuleTestSilentSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  'testSilent',
  ModuleTestAllConditionsSchema.try(ModuleTestSilentFullSchema),
);
