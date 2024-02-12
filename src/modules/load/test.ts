/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, expect, test } from '@jest/globals';
import type { ModuleLoadResult } from './index';
import { ModuleLoad } from './index';

import type { ModuleLoadInterface } from './schema.gen';
import path from 'node:path';

import { getTestRunContext } from '../../components/inventory.testutils';
import type { ModuleRunResult } from '../abstractModuleBase';
import { testExamples } from '../../util/testUtils';

describe('load module', () => {
  testExamples(__dirname);

  test('load', async () => {
    const runContext = getTestRunContext();

    const config: ModuleLoadInterface = { file: { path: path.resolve(__dirname, 'test', 'random.yaml') } };

    const module = new ModuleLoad(config);

    const expected: ModuleRunResult<ModuleLoadResult> = {
      vars: { veryRandomVar: 5 },
      changed: false,
    };

    await expect(module.run(runContext)).resolves.toEqual(expected);
  });
});
