import { newDebug } from '../../util/debug';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { newLogger } from '../../util/logger';

import type { InventoryHost } from '../../components/inventoryHost';

import type { HostSourceContext } from '../abstractHostSource';
import type http from 'node:http';
import {
  dataSourceHTTPListGetTestHTTPServerPromise,
  dataSourceHTTPListTestEntries,
} from '../../dataSources/httpList/test';
import type { AddressInfo } from 'node:net';
import type { DataSourceHTTPInterface } from '../../dataSources/http/schema.gen';
import { HostSourceHTTP } from './index';
import type { HostSourceHTTPInterface } from './schema.gen';
import { HostSourceHTTPInterfaceConfigKeyFirst } from './schema.gen';

const debug = newDebug(__filename);
const logger = newLogger();
const context: HostSourceContext = {
  logger,
  workDir: undefined,
};

type ExpectMatchFn = (host: Record<string, InventoryHost>, test: HostSourceHTTPTest) => void;

interface HostSourceHTTPTest {
  config: HostSourceHTTPInterface;
  expectMatch?: ExpectMatchFn;
}

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

function checkEntries(entries: Record<string, InventoryHost>) {
  expect(Object.keys(entries)).toEqual(Object.keys(dataSourceHTTPListTestEntries));
  for (const key of Object.keys(entries)) {
    const host = entries[key];
    expect(host.vars).toEqual(dataSourceHTTPListTestEntries[key]);
  }
}

describe('host source http', () => {
  test('list+load call', async () => {
    const source = new HostSourceHTTP({
      [HostSourceHTTPInterfaceConfigKeyFirst]: {
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
      },
    });

    const entries = await source.loadHostsStubs(context);
    await Promise.all(Object.keys(entries).map(async (e) => await entries[e].loadVars(context)));
    checkEntries(entries);
  });
});
