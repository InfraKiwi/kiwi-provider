/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, expect, test } from '@jest/globals';
import { ModuleSwitch } from './index';

import type { ModuleSwitchCaseFullInterface, ModuleSwitchInterface } from './schema.gen';

import { getTestRunContext } from '../../components/inventory.testutils';
import type { ModuleRunResult } from '../abstractModuleBase';
import type { VarsInterface } from '../../components/varsContainer.schema.gen';
import { testExamples } from '../../util/testUtils';

interface ModuleSwitchTest {
  args: ModuleSwitchInterface;
  expect?: ModuleRunResult<VarsInterface>;
}

describe('switch module', () => {
  testExamples(__dirname);

  const set = { val: '${{ __switchValue }}' };
  const casesSimple = {
    hello: {
      set,
      out: 'set',
    },
    world: {
      set,
      out: 'set',
    },
    two: [
      {
        set,
        out: 'set',
      },
      {
        set,
        out: 'set2',
      },
    ],
  };
  const defaultSimple = {
    set,
    out: 'set',
  };
  const casesComplex: ModuleSwitchCaseFullInterface[] = [
    {
      if: '__switchValue == "one"',
      task: {
        set,
        out: 'set',
      },
    },
    {
      if: '__switchValue == "two"',
      task: {
        set,
        out: 'set',
      },
      fallthrough: true,
    },
    {
      task: {
        set,
        out: 'setFallthrough',
      },
    },
  ];

  const tests: ModuleSwitchTest[] = [
    {
      args: {
        value: 'hello',
        cases: casesSimple,
      },
      expect: {
        vars: { set: { val: 'hello' } },
        changed: false,
      },
    },
    {
      args: {
        cases: casesSimple,
        default: defaultSimple,
      },
      expect: {
        vars: {
          set: { val: '' },
        },
        changed: false,
      },
    },
    {
      args: {
        value: 123,
        cases: casesSimple,
        default: defaultSimple,
      },
      expect: {
        vars: {
          set: { val: '123' },
        },
        changed: false,
      },
    },
    {
      args: {
        value: 'two',
        cases: casesSimple,
        default: defaultSimple,
      },
      expect: {
        vars: {
          set: { val: 'two' },
          set2: { val: 'two' },
        },
        changed: false,
      },
    },
    {
      args: {
        value: 'one',
        cases: casesComplex,
      },
      expect: {
        vars: { set: { val: 'one' } },
        changed: false,
      },
    },
    {
      args: {
        value: 'two',
        cases: casesComplex,
      },
      expect: {
        vars: {
          set: { val: 'two' },
          setFallthrough: { val: 'two' },
        },
        changed: false,
      },
    },
  ];

  test.each(tests)('$#', async (t) => {
    const runContext = getTestRunContext();
    const module = new ModuleSwitch(t.args);
    const result = await module.run(runContext);
    expect(result).toEqual(t.expect);
  });
});
