/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { ModuleDownload } from './index';

import type { ModuleDownloadHTTPRequestInterface, ModuleDownloadInterface } from './schema.gen';
import type * as http from 'node:http';
import express from 'express';
import { promisify } from 'node:util';
import type { AddressInfo } from 'node:net';

import { getTestRunContext } from '../../components/inventory.testutils';
import { testExamples } from '../../util/testUtils';
import path from 'node:path';
import { fsPromiseReadFile, fsPromiseTmpDir, fsPromiseTmpFile } from '../../util/fs';
import { UnarchiveArchiveType } from '../../util/unarchive';

const testAssets = path.join(__dirname, 'test', 'assets');

function getTestHTTPServer(callback: (err: unknown, server: http.Server) => void) {
  const app = express();
  app.get('/hello', (req, res) => res.send('hello'));
  app.get('/archive/tarGz', (req, res) => {
    res.sendFile(path.join(testAssets, 'archive.tar.gz'));
  });
  app.get('/archive/zip', (req, res) => {
    res.sendFile(path.join(testAssets, 'archive.zip'));
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.on('error', (err) => callback(err, undefined as any));
  const server = app.listen(
    {
      host: '127.0.0.1',
      port: 0,
    },
    () => {
      callback(undefined, server);
    }
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

describe('http module', () => {
  testExamples(__dirname);

  const getBaseHTTPConfig = (): Partial<ModuleDownloadHTTPRequestInterface> => {
    const address = testHTTPServer.address() as AddressInfo;
    const baseURL = `http://${address.address}:${address.port}`;
    return { baseURL };
  };

  test('download simple file', async () => {
    const tmpFile = await fsPromiseTmpFile({
      keep: false,
      discardDescriptor: true,
    });
    const config: ModuleDownloadInterface = {
      http: {
        ...getBaseHTTPConfig(),
        url: '/hello',
      },
      dest: tmpFile,
    };
    const runContext = getTestRunContext();
    const result = await new ModuleDownload(config).run(runContext);
    expect(result.vars?.size).not.toBeUndefined();
    const fileContents = await fsPromiseReadFile(tmpFile, 'utf-8');
    expect(fileContents).toEqual('hello');
  });

  describe('download and extract', () => {
    const tests: { archiveType: UnarchiveArchiveType; url: string }[] = [
      {
        archiveType: UnarchiveArchiveType['tar.gz'],
        url: '/archive/tarGz',
      },
      {
        archiveType: UnarchiveArchiveType.zip,
        url: '/archive/zip',
      },
    ];

    test.each(tests)('%p', async (t) => {
      const tmpDir = await fsPromiseTmpDir({ keep: false });
      const config: ModuleDownloadInterface = {
        http: {
          ...getBaseHTTPConfig(),
          url: t.url,
        },
        dest: tmpDir,
        extract: t.archiveType,
      };
      const runContext = getTestRunContext();
      const result = await new ModuleDownload(config).run(runContext);
      expect(result.vars?.size).not.toBeUndefined();
      {
        const fileContents = await fsPromiseReadFile(path.join(tmpDir, 'hello.txt'), 'utf-8');
        expect(fileContents).toEqual('hello');
      }
      {
        const fileContents = await fsPromiseReadFile(path.join(tmpDir, 'another', 'another.txt'), 'utf-8');
        expect(fileContents).toEqual('anotherMe');
      }
    });
  });
});
