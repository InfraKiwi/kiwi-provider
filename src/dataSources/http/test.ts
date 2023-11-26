import { newDebug } from '../../util/debug';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import type * as http from 'node:http';
import express from 'express';
import { promisify } from 'node:util';
import type { AddressInfo } from 'node:net';
import type { DataSourceHTTPInterface } from './schema.gen';
import { DataSourceHTTP } from './index';
import { newLogger } from '../../util/logger';

import type { DataSourceContext } from '../abstractDataSource';

const debug = newDebug(__filename);
const logger = newLogger();
const context: DataSourceContext = {
  logger,
  workDir: undefined,
};

function getTestHTTPServer(callback: (err: unknown, server: http.Server) => void) {
  const app = express();
  app.get('/hello', (req, res) => res.send('world'));
  app.get('/err', (req, res) => {
    res.status(400);
    res.send('Meh!');
  });
  app.get('/query', (req, res) => res.json(req.query));
  app.get('/object', (req, res) => res.json({ this: { is: { nested: 123 } } }));

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

const getTestHTTPServerPromise = promisify<http.Server>(getTestHTTPServer);

let testHTTPServer: http.Server;
beforeAll(async () => {
  testHTTPServer = await getTestHTTPServerPromise();
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

interface DataSourceHTTPTest {
  config: DataSourceHTTPInterface;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expectData?: any;
  expectStatus?: number;
}

describe('http dataSource', () => {
  const tests: DataSourceHTTPTest[] = [
    {
      config: { url: '/hello' },
      expectData: 'world',
    },
    {
      config: { url: '/err', validStatus: [400] },
      expectData: 'Meh!',
      expectStatus: 400,
    },
    {
      config: { url: '/err', validStatus: '4\\d{2}' },
      expectData: 'Meh!',
      expectStatus: 400,
    },
    {
      config: { url: '/query', params: { hello: 'world' } },
      expectData: { hello: 'world' },
    },
    {
      config: { url: '/object', filters: { jsonPath: '$.this.is.nested' } },
      expectData: 123,
    },
  ];

  test.each(tests)('$#', async (args) => {
    const config: DataSourceHTTPInterface = {
      ...getBaseConfig(),
      ...args.config,
    };

    const dataSource = new DataSourceHTTP(config);
    const result = await dataSource.load(context);
    if (args.expectData) {
      expect(result.data).toEqual(args.expectData);
    }
  });
});
