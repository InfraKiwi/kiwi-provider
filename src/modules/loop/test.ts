/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, expect, test } from '@jest/globals';
import type { ModuleLoopResult } from './index';
import { ModuleLoop } from './index';

import type { ModuleLoopInterface } from './schema.gen';

import { getTestRunContext } from '../../components/inventory.testutils';
import type { ModuleRunResult } from '../abstractModuleBase';
import { testExamples } from '../../util/testUtils';
import { ModuleLoopSchemaVarDefault } from './schema';

interface ModuleStoreTest {
  args: ModuleLoopInterface;
  expect?: ModuleRunResult<ModuleLoopResult>;
}

describe('loop module', () => {
  testExamples(__dirname);

  const debug = `\${{ ${ModuleLoopSchemaVarDefault}.key }}=\${{ ${ModuleLoopSchemaVarDefault}.item }}`;

  const tests: ModuleStoreTest[] = [
    {
      args: {
        items: ['hello', 'world'],
        task: {
          debug,
          out: 'debug',
        },
      },
      expect: {
        exit: false,
        vars: {
          results: [
            {
              vars: { debug: '0=hello' },
              changed: false,
            },
            {
              vars: { debug: '1=world' },
              changed: false,
            },
          ],
        },
        changed: false,
      },
    },
    {
      args: {
        items: {
          hello: 'world',
          zark: 'zork',
        },
        task: {
          debug,
          out: 'debug',
        },
      },
      expect: {
        exit: false,
        vars: {
          results: {
            hello: {
              vars: { debug: 'hello=world' },
              changed: false,
            },
            zark: {
              vars: { debug: 'zark=zork' },
              changed: false,
            },
          },
        },
        changed: false,
      },
    },
  ];

  test.each(tests)('$#', async (t) => {
    const runContext = getTestRunContext();
    const module = new ModuleLoop(t.args);

    await expect(module.run(runContext)).resolves.toEqual(t.expect);
  });
});
