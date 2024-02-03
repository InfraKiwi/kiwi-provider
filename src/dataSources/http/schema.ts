/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { joiMetaClassName } from '../../util/joi';
import { dataSourceRegistryEntryFactory } from '../registry';
import { AxiosRequestSchemaObject } from '../../util/axios.schema';

export const DataSourceHTTPRawSchema = Joi.object({
  // --- Response processing
  filters: Joi.object({
    jsonPath: Joi.string().description(`
The JSONPath used to extract the entries
See: https://github.com/JSONPath-Plus/JSONPath
`),
  }),

  // Overwrite the response type to NOT include the stream variant
  responseType: Joi.string().valid('json', 'text').default('json').optional().description(`
Indicates the type of data that the server will respond with.
`),
})
  .append(AxiosRequestSchemaObject)
  .meta(joiMetaClassName('DataSourceHTTPRawInterface'));

export const DataSourceHTTPSchema = dataSourceRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  DataSourceHTTPRawSchema,
  { name: 'DataSourceHTTPInterface' }
);
