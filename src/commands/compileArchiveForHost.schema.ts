/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { joiMetaClassName, joiObjectFromInstanceOf } from '../util/joi';
import path from 'node:path';
import { ArchiveSchema } from '../components/archive.schema';
import { InventorySchema } from '../components/inventory.schema';

export const CompileArchiveForHostArgsSchema = Joi.object({
  hostname: Joi.string().required(),
  inventory: joiObjectFromInstanceOf('Inventory', path.resolve(__dirname, '../components/inventory')).required(),
  archive: joiObjectFromInstanceOf('Archive', path.resolve(__dirname, '../components/archive')).required(),

  implicitHosts: Joi.array().items(Joi.string()),
}).meta(joiMetaClassName('CompileArchiveForHostArgsInterface'));

export const CompileArchiveForHostResultSchema = Joi.object({
  inventory: InventorySchema.required(),
  archive: ArchiveSchema.required(),
  stats: Joi.object(),
}).meta(joiMetaClassName('CompileArchiveForHostResultInterface'));
