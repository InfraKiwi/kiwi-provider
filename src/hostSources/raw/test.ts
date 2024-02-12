/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, expect, test } from '@jest/globals';
import { HostSourceRaw } from './index';
import type { HostSourceRawInterface } from './schema.gen';
import { newLogger } from '../../util/logger';

import type { InventoryHost } from '../../components/inventoryHost';

import type { HostSourceContext } from '../abstractHostSource';
import { HostSourceRawInterfaceConfigKeyFirst } from './schema.gen';
import { testExamples } from '../../util/testUtils';

const logger = newLogger();
const context: HostSourceContext = {
  logger,
  workDir: undefined,
};

type ExpectMatchFn = (host: Record<string, InventoryHost>, test: HostSourceRawTest) => void;

interface HostSourceRawTest {
  config: HostSourceRawInterface;
  expectMatch?: ExpectMatchFn;
}

describe('host source raw', () => {
  testExamples(__dirname);

  const tests: HostSourceRawTest[] = [
    {
      config: { 'host-1': {} },
      expectMatch: (h, test) => expect(h['host-1'].vars).toEqual({}),
    },
    {
      config: { 'host-2': { myVar: 2 } },
      expectMatch: (h, test) => {
        expect(h['host-2'].vars).toEqual({ myVar: 2 });
      },
    },
    {
      config: {
        'host-3': { myVar: 3 },
        'host-4': { myVar: 4 },
      },
      expectMatch: (h, test) => {
        expect(h['host-3'].vars).toEqual({ myVar: 3 });
        expect(h['host-4'].vars).toEqual({ myVar: 4 });
      },
    },
  ];

  test.each(tests)('$#', async (args: HostSourceRawTest) => {
    const source = new HostSourceRaw({ [HostSourceRawInterfaceConfigKeyFirst]: args.config });

    const hosts = await source.loadAllHosts(context);

    if (args.expectMatch) {
      args.expectMatch(hosts, args);
    }
  });
});
