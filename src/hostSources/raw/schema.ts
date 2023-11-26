import { hostSourceRegistryEntryFactory } from '../registry';
import { joiObjectWithPattern } from '../../util/joi';

import { VarsSchema } from '../../components/varsContainer.schema';

export const HostSourceRawSchema = hostSourceRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  joiObjectWithPattern(VarsSchema),
);
