import { describe, expect, test } from '@jest/globals';
import type { ModuleSetResult } from './index';
import { ModuleSet } from './index';

import type { ModuleSetInterface } from './schema.gen';

import { getTestRunContext } from '../../components/inventory.testutils';
import type { ModuleRunResult } from '../abstractModuleBase';
import { testExamples } from '../../util/testUtils';

describe('set module', () => {
  testExamples(__dirname);

  test('writes new vars in the context', async () => {
    const runContext = getTestRunContext();

    const config: ModuleSetInterface = { myVar: 'hello' };

    const module = new ModuleSet(config);

    const expected: ModuleRunResult<ModuleSetResult> = {
      vars: config,
      changed: false,
    };

    await expect(module.run(runContext)).resolves.toEqual(expected);
  });
});
