import Joi from 'joi';
import { VarsSchema } from '../components/varsContainer.schema';
import { joiMetaClassName } from '../util/joi';

export const ModuleRunResultSchema = Joi.object({
  failed: Joi.string(),
  exit: Joi.boolean(),
  vars: VarsSchema,
  changed: Joi.boolean(),
}).meta(joiMetaClassName('ModuleRunResultInterface'));
