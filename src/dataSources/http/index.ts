import { DataSourceHTTPSchema } from './schema';
import { newDebug } from '../../util/debug';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import axios from 'axios';

import * as AxiosLogger from 'axios-logger';
import type { ErrorLogConfig, RequestLogConfig, ResponseLogConfig } from 'axios-logger/lib/common/types';
import type { DataSourceHTTPInterface } from './schema.gen';
import { dataSourceRegistryEntryFactory } from '../registry';
import * as JSONPath from 'jsonpath-plus';
import type { DataSourceContext } from '../abstractDataSource';
import { AbstractDataSource } from '../abstractDataSource';

const debug = newDebug(__filename);

const axiosLoggingDefaultsRequest: RequestLogConfig = {
  params: true,
  data: false,
  headers: false,
};
const axiosLoggingDefaultsResponse: ResponseLogConfig = {
  params: false,
  data: false,
  headers: false,
};
const axiosLoggingDefaultsError: ErrorLogConfig = {
  params: true,
  data: false,
  headers: false,
};

export interface DataSourceHTTPResult {
  // `data` is the response that was provided by the server
  data: unknown;

  // `status` is the HTTP status code from the server response
  status: number;

  // `statusText` is the HTTP status message from the server response
  // As of HTTP/2 status text is blank or unsupported.
  // (HTTP/2 RFC: https://www.rfc-editor.org/rfc/rfc7540#section-8.1.2.4)
  statusText: string;

  // `headers` the HTTP headers that the server responded with
  // All header names are lower cased and can be accessed using the bracket notation.
  headers: Record<string, string>;
}

export class DataSourceHTTP extends AbstractDataSource<DataSourceHTTPInterface, DataSourceHTTPResult> {
  async load(context: DataSourceContext): Promise<DataSourceHTTPResult> {
    const { log, filters, validStatus, ...rest } = this.config;

    let validStatusFn: ((status: number) => boolean) | undefined;
    if (validStatus) {
      validStatusFn = (status) => {
        if (Array.isArray(validStatus)) {
          return validStatus.includes(status);
        }
        return new RegExp(validStatus).test(status.toString());
      };
    }

    const axiosRequestConfig: AxiosRequestConfig = {
      validateStatus: validStatusFn,
      ...rest,
    };

    const axiosInstance = axios.create();

    const loggerFn = context.logger?.info.bind(context.logger);
    if (loggerFn) {
      const errorLogger = (err: AxiosError) =>
        AxiosLogger.errorLogger(err, {
          ...axiosLoggingDefaultsError,
          ...log?.default,
          ...log?.error,
          logger: loggerFn,
        });
      axiosInstance.interceptors.request.use((req) => {
        return AxiosLogger.requestLogger(req, {
          ...axiosLoggingDefaultsRequest,
          ...log?.default,
          ...log?.request,
          logger: loggerFn,
          // TODO https://github.com/hg-pyun/axios-logger/issues/131
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any;
      }, errorLogger);
      axiosInstance.interceptors.response.use((req) => {
        return AxiosLogger.responseLogger(req, {
          ...axiosLoggingDefaultsResponse,
          ...log?.default,
          ...log?.request,
          logger: loggerFn,
          // TODO https://github.com/hg-pyun/axios-logger/issues/131
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any;
      }, errorLogger);
    }

    const { data, status, statusText, headers } = await axiosInstance.request(axiosRequestConfig);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let filteredData: any = data;

    if (filters?.jsonPath) {
      const jsonPath = filters.jsonPath;
      const jsonPathResult = JSONPath.JSONPath({
        path: jsonPath,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        json: data as any,
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
