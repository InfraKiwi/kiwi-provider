import { newDebug } from '../../util/debug';
import { afterAll, describe, expect, test } from '@jest/globals';
import type { ModuleStoreResult } from './index';
import { ModuleStore, ModuleStoreUnknownFileExtension } from './index';

import type { ModuleStoreInterface } from './schema.gen';
import * as fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { dump } from 'js-yaml';
import * as os from 'node:os';

import { getTestRunContext } from '../../components/inventory.testutils';
import type { ModuleRunResult } from '../abstractModuleBase';

const debug = newDebug(__filename);
const promiseRM = promisify(fs.rm);

interface ModuleStoreTest {
  args: ModuleStoreInterface;
  expect?: ModuleRunResult<Omit<ModuleStoreResult, 'path'>>;
  expectFailExtension?: boolean;
}

const tmpDir: string = fs.mkdtempSync(path.resolve(os.tmpdir(), 'ModuleStoreTest'));
afterAll(async () => {
  await promiseRM(tmpDir, { recursive: true, force: true });
});

let tmpCounter = 0;

function getTempFile(ext: string): string {
  return path.resolve(tmpDir, `tmp-${tmpCounter++}.${ext}`);
}

describe('store module', () => {
  const existingFileName = getTempFile('yaml');

  const tests: ModuleStoreTest[] = [
    {
      args: {
        path: getTempFile('yaml'),
        content: { hello: 'world' },
      },
      expect: { vars: { content: dump({ hello: 'world' }) }, changed: true },
    },
    // --- Overwriting
    {
      args: {
        path: existingFileName,
        content: 123,
      },
      expect: { vars: { content: '123\n' }, changed: true },
    },
    {
      args: {
        path: existingFileName,
        content: 123,
      },
      expect: { vars: { content: '123\n' }, changed: false },
    },
    {
      args: {
        path: existingFileName,
        content: 1234,
      },
      expect: { vars: { content: '1234\n' }, changed: true },
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
      expect: { vars: { content: 'hey' }, changed: true },
    },
  ];

  test.each(tests)('$#', async (t) => {
    const runContext = getTestRunContext();
    const module = new ModuleStore(t.args);

    if (t.expectFailExtension) {
      await expect(module.valid()).rejects.toThrowError(ModuleStoreUnknownFileExtension);
      return;
    }

    await module.valid();

    await expect(module.run(runContext)).resolves.toEqual({
      changed: t.expect?.changed,
      vars: { path: module.filePath, ...t.expect?.vars },
    });
  });
});
