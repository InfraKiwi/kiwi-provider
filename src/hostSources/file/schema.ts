/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { hostSourceRegistryEntryFactory } from '../registry';
import { DataSourceFileBaseSchemaObject } from '../../dataSources/file/schema';
import Joi from 'joi';

export const HostSourceFileSchema = hostSourceRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object(DataSourceFileBaseSchemaObject)
);
