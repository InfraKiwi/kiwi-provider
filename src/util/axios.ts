import type { Axios } from 'axios';
import { errorLogger, requestLogger, responseLogger } from 'axios-logger';
import type { ContextLogger } from './context';
import { IncomingMessage } from 'node:http';

export function addDefaultInterceptors({ logger }: ContextLogger, client: Axios, prefixText: string) {
  client.interceptors.request.use(
    (cfg) => {
      requestLogger(cfg, { logger: logger.info.bind(logger), prefixText });
      return cfg;
    },
    (err) => errorLogger(err, { logger: logger.error.bind(logger), prefixText }),
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
    (err) => errorLogger(err, { logger: logger.error.bind(logger), prefixText }),
  );
}
