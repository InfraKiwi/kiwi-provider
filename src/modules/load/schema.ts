import { newDebug } from '../../util/debug';
import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';
import { VarsSourceSchema } from '../../components/varsSource.schema';

const debug = newDebug(__filename);

export const ModuleLoadSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.alternatives([Joi.array().items(VarsSourceSchema), VarsSourceSchema]),
);
