/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { newLogger } from '../../util/logger';
import type http from 'node:http';
import type { AddressInfo } from 'node:net';
import type { DataSourceHTTPInterface } from '../http/schema.gen';
import { MultiDataSourceHTTPList } from './index';

import type { DataSourceContext } from '../abstractDataSource';
import { testExamples } from '../../util/testUtils';
import {
  dataSourceHTTPListGetTestHTTPServerPromise,
  dataSourceHTTPListTestEntriesNum,
  dataSourceHTTPListTestEntriesStr,
} from './test.helpers';

const logger = newLogger();
const context: DataSourceContext = {
  logger,
  workDir: undefined,
};

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

describe('data source httpList', () => {
  testExamples(__dirname);

  test('list+load call', async () => {
    const source = new MultiDataSourceHTTPList({
      default: getBaseConfig(),
      list: { http: { url: '/list' } },
      load: {
        http: {
          url: '/load',
          params: { id: '{{ id }}' },
        },
      },
    });

    const entries = await source.loadAllEntries(context);
    expect(entries).toEqual(dataSourceHTTPListTestEntriesStr);
  });

  test('list call returning objects', async () => {
    const source = new MultiDataSourceHTTPList({
      default: getBaseConfig(),
      list: {
        http: { url: '/listArrayWithObjects' },
        idField: 'id',
      },
    });

    const entries = await source.loadAllEntries(context);
    expect(entries).toEqual(dataSourceHTTPListTestEntriesStr);
  });

  test('list call returning array of object ids', async () => {
    const source = new MultiDataSourceHTTPList({
      default: getBaseConfig(),
      list: {
        http: { url: '/listArrayWithObjectIds' },
        idField: 'id',
      },
      load: {
        http: {
          url: '/load',
          params: { id: '{{ id }}' },
        },
      },
    });

    const entries = await source.loadAllEntries(context);
    expect(entries).toEqual(dataSourceHTTPListTestEntriesStr);
  });

  test('list call returning numeric ids', async () => {
    const source = new MultiDataSourceHTTPList({
      default: getBaseConfig(),
      list: { http: { url: '/listNum' } },
      load: {
        http: {
          url: '/loadNum',
          params: { id: '{{ id }}' },
        },
      },
    });

    const entries = await source.loadAllEntries(context);
    expect(Object.keys(entries).map((k) => parseInt(k))).toEqual(Array.from(dataSourceHTTPListTestEntriesNum.keys()));
    expect(Object.values(entries)).toEqual(Array.from(dataSourceHTTPListTestEntriesNum.values()));
  });
});
