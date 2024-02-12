/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, expect, test } from '@jest/globals';
import type { ModuleTemplateResult } from './index';
import { ModuleTemplate } from './index';

import type { ModuleTemplateInterface } from './schema.gen';

import { getTestRunContext } from '../../components/inventory.testutils';
import type { ModuleRunResult } from '../abstractModuleBase';
import { testExamples } from '../../util/testUtils';

interface ModuleTemplateTest {
  args: ModuleTemplateInterface;
  expect?: ModuleRunResult<ModuleTemplateResult>;
}

describe('_template module', () => {
  testExamples(__dirname);

  const tests: ModuleTemplateTest[] = [
    {
      args: { hello: 'world' },
      expect: {
        vars: { newValue: 'world123' },
        changed: true,
      },
    },
  ];

  test.each(tests)('$#', async (t) => {
    const runContext = getTestRunContext();
    const module = new ModuleTemplate(t.args);

    await expect(module.run(runContext)).resolves.toEqual(t.expect);
  });
});
