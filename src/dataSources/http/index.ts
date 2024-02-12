/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { DataSourceHTTPSchema } from './schema';

import type { DataSourceHTTPInterface } from './schema.gen';
import { dataSourceRegistryEntryFactory } from '../registry';
import * as JSONPath from 'jsonpath-plus';
import type { DataSourceContext } from '../abstractDataSource';
import { AbstractDataSource } from '../abstractDataSource';
import { executeAxiosRequest } from '../../util/axios';

export interface DataSourceHTTPResult {
  // `data` is the response that was provided by the server
  data: unknown;

  // `status` is the HTTP status code from the server response
  status: number;

  /*
   * `statusText` is the HTTP status message from the server response
   * As of HTTP/2 status text is blank or unsupported.
   * (HTTP/2 RFC: https://www.rfc-editor.org/rfc/rfc7540#section-8.1.2.4)
   */
  statusText: string;

  /*
   * `headers` the HTTP headers that the server responded with
   * All header names are lower cased and can be accessed using the bracket notation.
   */
  headers: Record<string, string>;
}

export class DataSourceHTTP extends AbstractDataSource<DataSourceHTTPInterface, DataSourceHTTPResult, unknown> {
  protected async getVarsFromLoadResult(result: DataSourceHTTPResult): Promise<unknown> {
    return result.data;
  }

  async load(context: DataSourceContext): Promise<DataSourceHTTPResult> {
    const { filters, ...rest } = this.config;

    const { data, status, statusText, headers } = await executeAxiosRequest(context, rest);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let filteredData: any = data;

    if (filters?.jsonPath) {
      const jsonPath = filters.jsonPath;
      const jsonPathResult = JSONPath.JSONPath({
        path: jsonPath,
        json: data,
        wrap: false,
      });
      filteredData = jsonPathResult;
    }

    const resultHeaders: Record<string, string> = {};
    for (const header in headers) {
      resultHeaders[header] = headers[header];
    }

    return {
      data: filteredData,
      status,
      statusText,
      headers: resultHeaders,
    };
  }
}

dataSourceRegistryEntryFactory.register(DataSourceHTTPSchema, DataSourceHTTP);
