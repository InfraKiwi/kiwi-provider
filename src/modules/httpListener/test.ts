/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe } from '@jest/globals';

import { testExamples } from '../../util/testUtils';
import type { ModuleHTTPListenerInterface } from './schema.gen';
import { getTestRunContext } from '../../components/inventory.testutils';
import { ModuleHTTPListener } from './index';
import { ModuleHTTP } from '../http';

interface ModuleHTTPListenerTest {
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expectData: any;
}

describe('httpListener module', () => {
  testExamples(__dirname);
  const runContext = getTestRunContext();

  afterAll(async () => {
    await runContext.executeShutdownHooks();
  });

  const config: ModuleHTTPListenerInterface = {
    routes: {
      '/hello': { get: (req, res) => res.send('world') },
      '/helloJSON': { get: { json: { text: 'world' } } },
      '/helloRaw': { get: { raw: 'world' } },
    },
  };

  const tests: ModuleHTTPListenerTest[] = [
    {
      path: '/hello',
      expectData: 'world',
    },
    {
      path: '/helloJSON',
      expectData: { text: 'world' },
    },
    {
      path: '/helloRaw',
      expectData: 'world',
    },
  ];

  test.each(tests)('$#', async (args) => {
    const module = new ModuleHTTPListener(config);
    const result = await module.run(runContext);
    expect(result.vars?.server).not.toBeUndefined();

    const resp = (await new ModuleHTTP({ url: `http://${result.vars!.address}${args.path}` }).run(runContext)).vars!
      .data;
    expect(resp).toEqual(args.expectData);
  });
});
