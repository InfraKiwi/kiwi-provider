import { newDebug } from '../../util/debug';
import { describe, expect, test } from '@jest/globals';
import { ModuleSwitch } from './index';

import type { ModuleSwitchCaseFullInterface, ModuleSwitchInterface } from './schema.gen';

import { getTestRunContext } from '../../components/inventory.testutils';
import type { ModuleRunResult } from '../abstractModuleBase';
import type { VarsInterface } from '../../components/varsContainer.schema.gen';

const debug = newDebug(__filename);

interface ModuleStoreTest {
  args: ModuleSwitchInterface;
  expect?: ModuleRunResult<VarsInterface>;
}

describe('switch module', () => {
  const debug = '${{ __switchValue }}';
  const casesSimple = {
    hello: {
      debug,
      out: 'debug',
    },
    world: {
      debug,
      out: 'debug',
    },
    two: [
      {
        debug,
        out: 'debug',
      },
      {
        debug,
        out: 'debug2',
      },
    ],
  };
  const defaultSimple = {
    debug,
    out: 'debug',
  };
  const casesComplex: ModuleSwitchCaseFullInterface[] = [
    {
      if: '__switchValue == "one"',
      task: { debug, out: 'debug' },
    },
    {
      if: '__switchValue == "two"',
      task: { debug, out: 'debug' },
      fallthrough: true,
    },
    {
      task: { debug, out: 'debugFallthrough' },
    },
  ];

  const tests: ModuleStoreTest[] = [
    {
      args: {
        value: 'hello',
        cases: casesSimple,
      },
      expect: { vars: { debug: 'hello' }, changed: false },
    },
    {
      args: {
        cases: casesSimple,
        default: defaultSimple,
      },
      expect: { vars: { debug: '' }, changed: false },
    },
    {
      args: {
        value: 123,
        cases: casesSimple,
        default: defaultSimple,
      },
      expect: { vars: { debug: '123' }, changed: false },
    },
    {
      args: {
        value: 'two',
        cases: casesSimple,
        default: defaultSimple,
      },
      expect: { vars: { debug: 'two', debug2: 'two' }, changed: false },
    },
    {
      args: {
        value: 'one',
        cases: casesComplex,
      },
      expect: { vars: { debug: 'one' }, changed: false },
    },
    {
      args: {
        value: 'two',
        cases: casesComplex,
      },
      expect: { vars: { debug: 'two', debugFallthrough: 'two' }, changed: false },
    },
  ];

  test.each(tests)('$#', async (t) => {
    const runContext = getTestRunContext();
    const module = new ModuleSwitch(t.args);

    await expect(module.run(runContext)).resolves.toEqual(t.expect);
  });
});
