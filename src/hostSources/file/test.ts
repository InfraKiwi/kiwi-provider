import { newDebug } from '../../util/debug';
import { describe, test } from '@jest/globals';
import { HostSourceFile } from './index';
import path from 'node:path';
import { ValidationError } from 'joi';
import { expectCatch } from '../../util/jest';
import { newLogger } from '../../util/logger';

import type { InventoryHost } from '../../components/inventoryHost';

import type { HostSourceContext } from '../abstractHostSource';
import { HostSourceFileInterfaceConfigKeyFirst } from './schema.gen';

const debug = newDebug(__filename);
const logger = newLogger();
const context: HostSourceContext = {
  logger,
  workDir: undefined,
};

interface HostSourceFileTest {
  filename: string;
  expectHostname?: string;
  expectVars?: object;
  failNonExistent?: boolean;
  failLoad?: boolean;
  failValidateVars?: boolean;
}

describe('host source file', () => {
  const tests: HostSourceFileTest[] = [
    {
      filename: 'ok.yaml',
      expectHostname: 'ok',
      expectVars: { myVar: 'hey' },
    },
    {
      filename: 'subdir/nestedhost.yaml',
      expectHostname: 'nestedhost',
      expectVars: { amINested: 'yes' },
    },
    {
      filename: 'badVars.yaml',
      expectHostname: 'badVars',
      failLoad: true,
      failValidateVars: true,
    },
    {
      filename: 'nonExistent.yaml',
      failNonExistent: true,
    },
  ];

  test.each(tests)('$#', async (args: HostSourceFileTest) => {
    const filePath = path.resolve(__dirname, 'test', args.filename);

    const source = new HostSourceFile({ [HostSourceFileInterfaceConfigKeyFirst]: { path: filePath } });

    let hosts: Record<string, InventoryHost>;

    try {
      hosts = await source.loadHostsStubs(context);
      const hostnames = Object.keys(hosts);
      expect(args.failNonExistent).not.toBe(true);
      expect(hostnames).toHaveLength(1);
      expect(hostnames[0]).toEqual(args.expectHostname);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (ex: any) {
      expect(args.failNonExistent, ex.toString()).toBe(true);
      return;
    }

    try {
      const host = Object.values(hosts)[0];
      await host.loadVars(context);
      expect(args.failLoad).not.toBe(true);
      expect(host.vars).toEqual(args.expectVars);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (ex: any) {
      if (args.failValidateVars) {
        expectCatch(ex, ex).toBeInstanceOf(ValidationError);
      }
      expectCatch(args.failLoad, ex).toBe(true);
      return;
    }
  });
});
