/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { joiMetaClassName } from '../util/joi';
import { VarsContainerSchemaObject } from './varsContainer.schema';

export const InventoryEntryVarsRelationsKeyDefault = '__relations';

export const InventoryEntryRelationsSchema = Joi.array()
  .items(Joi.string())
  .meta(joiMetaClassName('InventoryEntryRelationsInterface'));

export const InventoryEntrySchemaObject = {
  relations: InventoryEntryRelationsSchema.description(
    'Defines which other hosts/groups shall be included in the compiled inventory'
  ),

  varsKeyRelations: Joi.string().default(InventoryEntryVarsRelationsKeyDefault).optional().description(`
    Defines a key that, if found in the entry vars, will also be used to populate
    the \`relations\` array. 
  `),

  ...VarsContainerSchemaObject,
};

export const InventoryEntrySchema = Joi.object(InventoryEntrySchemaObject).meta({
  className: 'InventoryEntryInterface',
});
