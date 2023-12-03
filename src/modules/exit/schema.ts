import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';
import { joiMetaClassName } from '../../util/joi';

export const ModuleExitFullSchema = Joi.object({ message: Joi.string() }).meta(
  joiMetaClassName('ModuleExitFullInterface'),
);

export const ModuleExitSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.alternatives([Joi.string(), ModuleExitFullSchema]),
);
