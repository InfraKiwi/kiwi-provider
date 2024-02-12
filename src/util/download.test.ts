/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import axios from 'axios';
import { addDefaultInterceptors } from './axios';
import { getTestRunContext } from '../components/inventory.testutils';
import { downloadFile } from './download';
import { fsPromiseTmpFile } from './fs';
import { ModuleHTTPListener } from '../modules/httpListener';
import { testUtilRegisterServer, testUtilTearDown } from '../testutil/runner';
import type { AddressInfo } from 'node:net';

describe('download', () => {
  afterEach(() => testUtilTearDown());

  test('fails and logs successfully', async () => {
    const context = getTestRunContext();
    const client = axios.create({});
    addDefaultInterceptors(context, client, 'Teeeest');

    const listener = await new ModuleHTTPListener({
      routes: {
        '/': {
          get: (req, res) => {
            res.status(500).json({ error: 'Oh no!' });
          },
        },
      },
    }).run(context);
    testUtilRegisterServer(listener.vars!.server);

    const address = listener.vars!.server.address() as AddressInfo;
    const p = downloadFile(
      `http://${address.address}:${address.port}`,
      await fsPromiseTmpFile({
        keep: false,
        discardDescriptor: true,
      }),
      client
    );
    await expect(p).rejects.toThrow();
  });
});
