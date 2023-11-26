import { newDebug } from '../../util/debug';
import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';

const debug = newDebug(__filename);

const ModuleStoreSchemaBase = Joi.object({
  path: Joi.string().required(),
  workDir: Joi.string(),
});

export const ModuleStoreSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.alternatives([
    ModuleStoreSchemaBase.append({
      content: Joi.string().required(),
      // If true, do not auto-convert the contents to fit the file type
      raw: Joi.boolean(),
    }),
    ModuleStoreSchemaBase.append({
      content: Joi.any().required(),
      // If the content type is not a string, then it needs to be forcefully stringified
      raw: Joi.boolean().valid(false),
    }),
  ]),
);
