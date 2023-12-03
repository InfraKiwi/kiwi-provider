import { describe, expect, test } from '@jest/globals';
import type { ModuleShellResult } from './index';
import { ModuleShell } from './index';
import type { ModuleShellInterface } from './schema.gen';

import { getTestRunContext } from '../../components/inventory.testutils';
import type { ModuleRunResult } from '../abstractModuleBase';
import { testExamples } from '../../util/testUtils';
import { platformNewLine } from '../../util/constants';

describe('shell module', () => {
  testExamples(__dirname);

  test('invokes shell', async () => {
    const config: ModuleShellInterface = `echo Hello`;

    const module = new ModuleShell(config);

    const expected: ModuleRunResult<ModuleShellResult> = {
      vars: {
        stdout: 'Hello' + platformNewLine,
        stderr: '',
        exitCode: 0,
      },
      changed: true,
    };

    await expect(module.run(getTestRunContext())).resolves.toEqual(expected);
  });
});
