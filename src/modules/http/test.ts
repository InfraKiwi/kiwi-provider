import { newDebug } from '../../util/debug';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { ModuleHTTP } from './index';

import type { ModuleHTTPInterface } from './schema.gen';
import type * as http from 'node:http';
import express from 'express';
import { promisify } from 'node:util';
import type { AddressInfo } from 'node:net';

import { getTestRunContext } from '../../components/inventory.testutils';

const debug = newDebug(__filename);

function getTestHTTPServer(callback: (err: unknown, server: http.Server) => void) {
  const app = express();
  app.get('/hello', (req, res) => res.send('world'));
  app.get('/err', (req, res) => {
    res.status(400);
    res.send('Meh!');
  });
  app.get('/query', (req, res) => res.json(req.query));

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

interface ModuleHTTPTest {
  config: ModuleHTTPInterface;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expectData?: any;
  expectStatus?: number;
}

describe('http module', () => {
  const tests: ModuleHTTPTest[] = [
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
  ];

  test.each(tests)('$#', async (args) => {
    const address = testHTTPServer.address() as AddressInfo;
    // noinspection HttpUrlsUsage
    const baseURL = `http://${address.address}:${address.port}`;
    const baseConfig: ModuleHTTPInterface = {
      baseURL,
    };

    const runContext = getTestRunContext();

    const config: ModuleHTTPInterface = {
      ...baseConfig,
      ...args.config,
    };

    const module = new ModuleHTTP(config);
    const result = await module.run(runContext);
    if (args.expectData) {
      expect(result.vars?.data).toEqual(args.expectData);
    }
  });
});
