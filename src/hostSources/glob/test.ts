import { newDebug } from '../../util/debug';
import { describe, expect, test } from '@jest/globals';
import { HostSourceGlob } from './index';
import path from 'node:path';
import { newLogger } from '../../util/logger';

import type { HostSourceContext } from '../abstractHostSource';
import { HostSourceGlobInterfaceConfigKeyFirst } from './schema.gen';

const debug = newDebug(__filename);
const logger = newLogger();
const context: HostSourceContext = {
  logger,
  workDir: undefined,
};

describe('host source glob', () => {
  test('gets the right files', async () => {
    const source = new HostSourceGlob({
      [HostSourceGlobInterfaceConfigKeyFirst]: {
        pattern: `*.yaml`,
        workDir: path.resolve(__dirname, 'test'),
      },
    });
    const hosts = await source.loadHostsStubs(context);

    expect(Object.keys(hosts)).toEqual(['host-1', 'host-2']);
  });

  test('loads the right files', async () => {
    const source = new HostSourceGlob({
      [HostSourceGlobInterfaceConfigKeyFirst]: {
        pattern: '*.yaml',
        workDir: path.resolve(__dirname, 'test'),
      },
    });
    const hosts = await source.loadAllHosts(context);

    expect(hosts).toHaveProperty('host-1');
    expect(hosts).toHaveProperty('host-2');

    expect(hosts['host-1'].vars).toEqual({ myVar: 1 });
    expect(hosts['host-2'].vars).toEqual({ myVar: 2 });
  });
});
