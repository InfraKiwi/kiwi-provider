/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';
import { joiMetaClassName, joiObjectWithPattern, joiValidateValidIfTemplate } from '../../util/joi';

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
  ModuleTestAllConditionsSchema.try(ModuleTestFullSchema)
);

export const ModuleTestSilentSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  'testSilent',
  ModuleTestAllConditionsSchema.try(ModuleTestSilentFullSchema)
);
