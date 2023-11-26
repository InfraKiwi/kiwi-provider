import { newDebug } from '../../util/debug';
import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';
import { joiMetaClassName } from '../../util/joi';

const debug = newDebug(__filename);

export const ModuleFailFullSchema = Joi.object({
  message: Joi.string(),
  vars: Joi.object(),
}).meta(joiMetaClassName('ModuleFailFullInterface'));

export const ModuleFailSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.alternatives([Joi.string(), ModuleFailFullSchema]),
);
