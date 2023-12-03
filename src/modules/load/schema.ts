import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';
import { VarsSourceSchema } from '../../components/varsSource.schema';

export const ModuleLoadSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.alternatives([Joi.array().items(VarsSourceSchema), VarsSourceSchema]),
);
