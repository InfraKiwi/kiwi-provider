/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, expect, test } from '@jest/globals';
import { ModuleExec } from './index';
import type { ModuleExecInterface, ModuleExecResultInterface } from './schema.gen';

import { getTestRunContext } from '../../components/inventory.testutils';
import type { ModuleRunResult } from '../abstractModuleBase';
import { fsPromiseTmpFile, fsPromiseWriteFile } from '../../util/fs';
import { testExamples } from '../../util/testUtils';
import { platformIsWin } from '../../util/constants';

describe('exec module', () => {
  testExamples(__dirname);

  test('invokes exec', async () => {
    const file = await fsPromiseTmpFile({
      keep: false,
      discardDescriptor: true,
    });
    await fsPromiseWriteFile(file, 'Hello');
    const config: ModuleExecInterface = platformIsWin
      ? ['PowerShell', '-Command', 'echo "Hello"']
      : ['bash', '-c', 'echo "Hello"'];

    const module = new ModuleExec(config);

    const expected: ModuleRunResult<ModuleExecResultInterface> = {
      vars: {
        stdout: `Hello` + '\n',
        stderr: '',
        exitCode: 0,
      },
      changed: true,
    };

    await expect(module.run(getTestRunContext())).resolves.toEqual(expected);
  });
});
