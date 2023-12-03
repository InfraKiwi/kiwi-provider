import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';
import { joiMetaClassName } from '../../util/joi';

export const ModuleFailFullSchema = Joi.object({ message: Joi.string() }).meta(
  joiMetaClassName('ModuleFailFullInterface'),
);

export const ModuleFailSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.alternatives([Joi.string(), ModuleFailFullSchema]),
);
