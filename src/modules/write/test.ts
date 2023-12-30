/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { afterAll, describe, expect, test } from '@jest/globals';
import type { ModuleWriteResult } from './index';
import { ModuleWrite, ModuleWriteUnknownFileExtension } from './index';

import type { ModuleWriteInterface } from './schema.gen';
import * as fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { dump } from 'js-yaml';
import * as os from 'node:os';

import { getTestRunContext } from '../../components/inventory.testutils';
import type { ModuleRunResult } from '../abstractModuleBase';
import { testExamples } from '../../util/testUtils';

const promiseRM = promisify(fs.rm);

interface ModuleWriteTest {
  args: ModuleWriteInterface;
  expect?: ModuleRunResult<Omit<ModuleWriteResult, 'path'>>;
  expectFailExtension?: boolean;
}

const tmpDir: string = fs.mkdtempSync(path.resolve(os.tmpdir(), 'ModuleWriteTest'));
afterAll(async () => {
  await promiseRM(tmpDir, {
    recursive: true,
    force: true,
  });
});

let tmpCounter = 0;

function getTempFile(ext: string): string {
  return path.resolve(tmpDir, `tmp-${tmpCounter++}.${ext}`);
}

describe('write module', () => {
  testExamples(__dirname);

  const existingFileName = getTempFile('yaml');

  const tests: ModuleWriteTest[] = [
    {
      args: {
        path: getTempFile('yaml'),
        content: { hello: 'world' },
      },
      expect: {
        vars: { content: dump({ hello: 'world' }) },
        changed: true,
      },
    },
    // --- Overwriting
    {
      args: {
        path: existingFileName,
        content: 123,
      },
      expect: {
        vars: { content: '123\n' },
        changed: true,
      },
    },
    {
      args: {
        path: existingFileName,
        content: 123,
      },
      expect: {
        vars: { content: '123\n' },
        changed: false,
      },
    },
    {
      args: {
        path: existingFileName,
        content: 1234,
      },
      expect: {
        vars: { content: '1234\n' },
        changed: true,
      },
    },
    {
      args: {
        path: getTempFile('hmmmm'),
        content: { hello: 'world' },
      },
      expectFailExtension: true,
    },
    {
      args: {
        path: getTempFile('hmmmm'),
        content: 'hey',
        raw: true,
      },
      expect: {
        vars: { content: 'hey' },
        changed: true,
      },
    },
  ];

  test.each(tests)('$#', async (t) => {
    const runContext = getTestRunContext();
    const module = new ModuleWrite(t.args);

    if (t.expectFailExtension) {
      await expect(module.valid()).rejects.toThrowError(ModuleWriteUnknownFileExtension);
      return;
    }

    await module.valid();

    await expect(module.run(runContext)).resolves.toEqual({
      changed: t.expect?.changed,
      vars: {
        path: module.filePath,
        ...t.expect?.vars,
      },
    });
  });
});
