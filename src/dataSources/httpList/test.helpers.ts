/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type http from 'node:http';
import express from 'express';
import { promisify } from 'node:util';

export const dataSourceHTTPListTestEntriesStr: Record<string, object> = {
  hello: { num: 1 },
  world: { num: 2 },
  cow: { num: 3 },
};
export const dataSourceHTTPListTestEntriesNum = new Map<number, string>([
  [1, 'hello'],
  [2, 'world'],
]);

function dataSourceHTTPListGetTestHTTPServer(callback: (err: unknown, server: http.Server) => void) {
  const app = express();
  app.get('/list', (req, res) => res.send(Object.keys(dataSourceHTTPListTestEntriesStr)));
  app.get('/load', (req, res) => res.send(dataSourceHTTPListTestEntriesStr[req.query['id'] as string]));
  app.get('/listArrayWithObjects', (req, res) =>
    res.send(
      Object.keys(dataSourceHTTPListTestEntriesStr)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .reduce((acc: any[], id) => {
          acc.push({
            id,
            ...dataSourceHTTPListTestEntriesStr[id],
          });
          return acc;
        }, [])
    ));
  app.get('/listArrayWithObjectIds', (req, res) =>
    res.send(
      Object.keys(dataSourceHTTPListTestEntriesStr)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .reduce((acc: any[], id) => {
          acc.push({ id });
          return acc;
        }, [])
    ));
  app.get('/listNum', (req, res) => res.send(Array.from(dataSourceHTTPListTestEntriesNum.keys())));
  app.get('/loadNum', (req, res) =>
    res.send(dataSourceHTTPListTestEntriesNum.get(parseInt(req.query['id'] as string))));

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

export const dataSourceHTTPListGetTestHTTPServerPromise = promisify<http.Server>(dataSourceHTTPListGetTestHTTPServer);
