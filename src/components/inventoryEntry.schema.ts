import Joi from 'joi';
import { joiMetaClassName } from '../util/joi';
import { VarsContainerSchema } from './varsContainer.schema';

export const InventoryEntryVarsRelationsKeyDefault = '__relations';

export const InventoryEntryRelationsSchema = Joi.array()
  .items(Joi.string())
  .meta(joiMetaClassName('InventoryEntryRelationsInterface'));

export const InventoryEntrySchema = VarsContainerSchema.append({
  // Defines which other hosts/groups shall be included in the compiled inventory
  relations: InventoryEntryRelationsSchema,

  // Defines key which, if defined in the entry vars, will populate the relations field with
  varsKeyRelations: Joi.string().default(InventoryEntryVarsRelationsKeyDefault).optional(),
}).meta({ className: 'InventoryEntryInterface' });
