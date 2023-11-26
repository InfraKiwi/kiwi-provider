import { newDebug } from '../../util/debug';
import { describe, expect, test } from '@jest/globals';
import type { ModuleDebugResult } from './index';
import { ModuleDebug } from './index';

import type { ModuleDebugInterface } from './schema.gen';

import { getTestRunContext } from '../../components/inventory.testutils';
import type { ModuleRunResult } from '../abstractModuleBase';

const debug = newDebug(__filename);

describe('debug module', () => {
  test('DEBUG', async () => {
    const runContext = getTestRunContext();

    const config: ModuleDebugInterface = {};

    const module = new ModuleDebug(config);

    const expected: ModuleRunResult<ModuleDebugResult> = {
      vars: config,
      changed: false,
    };

    await expect(module.run(runContext)).resolves.toEqual(expected);
  });
});
