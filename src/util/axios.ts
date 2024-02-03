/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { Axios, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios, { type AxiosError } from 'axios';
import * as AxiosLogger from 'axios-logger';
import { errorLogger, requestLogger, responseLogger } from 'axios-logger';
import type { ContextLogger } from './context';
import { IncomingMessage } from 'node:http';
import type { DataSourceContext } from '../dataSources/abstractDataSource';
import type { ErrorLogConfig, RequestLogConfig, ResponseLogConfig } from 'axios-logger/lib/common/types';
import type { AxiosRequestInterface } from './axios.schema.gen';
import Joi from 'joi';
import { joiAttemptRequired } from './joi';
import type { CancelToken } from 'axios/index';

export function addDefaultInterceptors({ logger }: ContextLogger, client: Axios, prefixText: string) {
  client.interceptors.request.use(
    (cfg) => {
      requestLogger(cfg, {
        logger: logger.info.bind(logger),
        prefixText,
      });
      return cfg;
    },
    (err) =>
      errorLogger(err, {
        logger: logger.error.bind(logger),
        prefixText,
      })
  );
  client.interceptors.response.use(
    (res) => {
      // https://github.com/hg-pyun/axios-logger/issues/115
      let data;
      if (res.data instanceof IncomingMessage) {
        data = res.data;
        res.data = '<IncomingMessage>';
      }
      responseLogger(res);
      if (data) {
        res.data = data;
      }
      return res;
    },
    (err) =>
      errorLogger(err, {
        logger: logger.error.bind(logger),
        prefixText,
      })
  );
}

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

export interface AxiosRequestInterfaceAdditionalProperties {
  responseType?: 'json' | 'text' | 'stream';
  cancelToken?: CancelToken;
}

export async function executeAxiosRequest(
  context: DataSourceContext,
  config: AxiosRequestInterface & AxiosRequestInterfaceAdditionalProperties
): Promise<AxiosResponse> {
  const { log, validStatus, ...rest } = config;

  let validStatusFn: ((status: number) => boolean) | undefined;
  if (validStatus) {
    validStatusFn = (status) => {
      if (Array.isArray(validStatus)) {
        return validStatus.includes(status);
      } else if (Joi.isSchema(validStatus)) {
        return joiAttemptRequired(status, validStatus as Joi.Schema);
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
      });
    }, errorLogger);
    axiosInstance.interceptors.response.use((req) => {
      return AxiosLogger.responseLogger(req, {
        ...axiosLoggingDefaultsResponse,
        ...log?.default,
        ...log?.request,
        logger: loggerFn,
      });
    }, errorLogger);
  }

  return axiosInstance.request(axiosRequestConfig);
}
