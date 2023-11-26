import type { Axios } from 'axios';
import { errorLogger, requestLogger, responseLogger } from 'axios-logger';
import type { ContextLogger } from './context';

export function addDefaultInterceptors({ logger }: ContextLogger, client: Axios, prefixText: string) {
  client.interceptors.request.use(
    (cfg) => {
      requestLogger(cfg, { logger: logger.info.bind(logger), prefixText });
      return cfg;
    },
    (err) => errorLogger(err, { logger: logger.error.bind(logger), prefixText }),
  );
  client.interceptors.response.use(
    (res) => responseLogger(res, { logger: logger.info.bind(logger), prefixText }),
    (err) => errorLogger(err, { logger: logger.error.bind(logger), prefixText }),
  );
}
