import Joi from 'joi';
import { assetsDistributionRegistryEntryFactory } from '../registry';

export const AssetsDistributionDirSchema = assetsDistributionRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    path: Joi.string().required(),
  }),
);
