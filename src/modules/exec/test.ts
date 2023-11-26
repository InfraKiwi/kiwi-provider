import { newDebug } from '../../util/debug';
import { describe, expect, test } from '@jest/globals';
import type { ModuleExecResult } from './index';
import { ModuleExec } from './index';
import type { ModuleExecInterface } from './schema.gen';

import { getTestRunContext } from '../../components/inventory.testutils';
import type { ModuleRunResult } from '../abstractModuleBase';
import { platformIsWin, platformNewLine } from '../../util/os';
import { fsPromiseTmpFile, fsPromiseWriteFile } from '../../util/fs';

const debug = newDebug(__filename);

describe('exec module', () => {
  test('invokes exec', async () => {
    const file = await fsPromiseTmpFile({ keep: false, discardDescriptor: true });
    await fsPromiseWriteFile(file, 'Hello');
    const config: ModuleExecInterface = platformIsWin
      ? ['PowerShell', '-Command', 'echo "Hello"']
      : ['bash', '-c', 'echo "Hello"'];

    const module = new ModuleExec(config);

    const expected: ModuleRunResult<ModuleExecResult> = {
      vars: {
        stdout: `Hello${platformNewLine}`,
        stderr: '',
        exitCode: 0,
      },
      changed: true,
    };

    await expect(module.run(getTestRunContext())).resolves.toEqual(expected);
  });
});
