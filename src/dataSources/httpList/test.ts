import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { newLogger } from '../../util/logger';
import type http from 'node:http';
import express from 'express';
import { promisify } from 'node:util';
import type { AddressInfo } from 'node:net';
import type { DataSourceHTTPInterface } from '../http/schema.gen';
import { MultiDataSourceHTTPList } from './index';

import type { DataSourceContext } from '../abstractDataSource';

const logger = newLogger();
const context: DataSourceContext = {
  logger,
  workDir: undefined,
};

export const dataSourceHTTPListTestEntries: Record<string, object> = {
  hello: {
    num: 1,
  },
  world: {
    num: 2,
  },
  cow: {
    num: 3,
  },
};

function dataSourceHTTPListGetTestHTTPServer(callback: (err: unknown, server: http.Server) => void) {
  const app = express();
  app.get('/list', (req, res) => res.send(Object.keys(dataSourceHTTPListTestEntries)));
  app.get('/load', (req, res) => res.send(dataSourceHTTPListTestEntries[req.query['id'] as string]));
  app.get('/listArrayWithObjects', (req, res) =>
    res.send(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Object.keys(dataSourceHTTPListTestEntries).reduce((acc: any[], id) => {
        acc.push({ id, ...dataSourceHTTPListTestEntries[id] });
        return acc;
      }, []),
    ),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.on('error', (err) => callback(err, undefined as any));
  const server = app.listen(
    {
      host: '127.0.0.1',
      port: 0,
    },
    () => {
      callback(undefined, server);
    },
  );
}

export const dataSourceHTTPListGetTestHTTPServerPromise = promisify<http.Server>(dataSourceHTTPListGetTestHTTPServer);

let testHTTPServer: http.Server;
beforeAll(async () => {
  testHTTPServer = await dataSourceHTTPListGetTestHTTPServerPromise();
});

afterAll(async () => {
  testHTTPServer.close();
});

function getBaseConfig() {
  const address = testHTTPServer.address() as AddressInfo;
  // noinspection HttpUrlsUsage
  const baseURL = `http://${address.address}:${address.port}`;
  const baseConfig: DataSourceHTTPInterface = {
    baseURL,
    log: {
      default: {
        params: true,
        data: true,
      },
    },
  };
  return baseConfig;
}

describe('data source http', () => {
  test('list+load call', async () => {
    const source = new MultiDataSourceHTTPList({
      default: getBaseConfig(),
      list: {
        url: '/list',
      },
      load: {
        url: '/load',
        params: {
          id: '{{ id }}',
        },
      },
    });

    const entries = await source.loadAllEntries(context);
    expect(entries).toEqual(dataSourceHTTPListTestEntries);
  });

  test('list call returning objects', async () => {
    const source = new MultiDataSourceHTTPList({
      default: getBaseConfig(),
      list: {
        url: '/listArrayWithObjects',
        idField: 'id',
      },
    });

    const entries = await source.loadAllEntries(context);
    expect(entries).toEqual(dataSourceHTTPListTestEntries);
  });
});
