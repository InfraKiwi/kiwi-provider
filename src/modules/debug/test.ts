import { describe, expect, test } from '@jest/globals';
import type { ModuleDebugResult } from './index';
import { ModuleDebug } from './index';

import type { ModuleDebugInterface } from './schema.gen';

import { getTestRunContext } from '../../components/inventory.testutils';
import type { ModuleRunResult } from '../abstractModuleBase';
import { testExamples } from '../../util/testUtils';
import Joi from 'joi';

describe('debug module', () => {
  testExamples(__dirname);

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

  test('disable shortie', () => {
    {
      const schema = Joi.any();
      const description = schema.describe();

      expect(description).not.toBeUndefined();
    }
    {
      const schema = Joi.alternatives([Joi.object(), Joi.string()]);
      const description = schema.describe();

      expect(description).not.toBeUndefined();
    }
    {
      const schema = Joi.string();
      const description = schema.describe();

      expect(description).not.toBeUndefined();
    }
  });
});
