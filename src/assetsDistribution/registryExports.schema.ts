import Joi from 'joi';
import { AssetsDistributionDirSchema } from './dir/schema';

export const registryEntriesAssetsDistributionSchema = Joi.object({
  dir: AssetsDistributionDirSchema,
}).meta({ className: 'registryEntriesAssetsDistributionInterface' });
