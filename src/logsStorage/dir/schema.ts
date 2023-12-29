/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { logsStorageRegistryEntryFactory } from '../registry';

export const LogsStorageDirSchema = logsStorageRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    path: Joi.string().required(),
  })
);
