/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, test } from '@jest/globals';
import type { ModuleStatResult } from './index';
import { ModuleStat, ModuleStatErrorFileNotFound } from './index';

import type { ModuleStatInterface } from './schema.gen';
import * as tmp from 'tmp';
import fs from 'node:fs';

import { getTestRunContext } from '../../components/inventory.testutils';
import type { ModuleRunResult } from '../abstractModuleBase';
import { testExamples } from '../../util/testUtils';

interface ModuleStoreTest {
  args: ModuleStatInterface;
  expect?: (result: ModuleRunResult<ModuleStatResult>) => boolean;
  expectThrowNotFound?: boolean;
}

const tmpFile = tmp.fileSync({ discardDescriptor: true }).name;
const tmpLink = tmp.tmpNameSync();
fs.symlinkSync(tmpFile, tmpLink);

describe('stat module', () => {
  testExamples(__dirname);

  const tests: ModuleStoreTest[] = [
    {
      args: { path: tmpLink },
      expect: (r) => r.vars?.exists == true,
    },
    {
      args: { path: tmpLink },
      expect: (r) => r.vars?.exists == true && r.vars.stat?.isSymbolicLink == true,
    },
    {
      args: {
        path: tmpLink,
        follow: true,
      },
      expect: (r) => r.vars?.exists == true && r.vars.stat?.isSymbolicLink == false,
    },
    {
      args: { path: 'randomrandomrandome123' },
      expect: (r) => r.vars?.exists == false,
    },
    {
      args: {
        path: 'randomrandomrandome123',
        throw: true,
      },
      expectThrowNotFound: true,
    },
  ];

  test.each(tests)('$#', async (t) => {
    const runContext = getTestRunContext();
    const module = new ModuleStat(t.args);

    const p = module.run(runContext);

    if (t.expectThrowNotFound) {
      await expect(p).rejects.toThrowError(ModuleStatErrorFileNotFound);
      return;
    }

    const result = await p;

    expect(t.expect).not.toBeUndefined();
    expect(t.expect!(result), `Result: ${JSON.stringify(result)}`).toBe(true);
  });
});
