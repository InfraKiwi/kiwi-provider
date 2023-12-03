import { describe, expect, test } from '@jest/globals';
import { ModuleInfo } from './index';

import { getTestRunContext } from '../../components/inventory.testutils';
import type { ModuleInfoInterface } from './schema.gen';
import { testExamples } from '../../util/testUtils';

describe('info module', () => {
  testExamples(__dirname);

  test('get osInfo', async () => {
    const runContext = getTestRunContext();

    const config: ModuleInfoInterface = {
      osInfo: true,
      // inetChecksite: { url: 'https://google.com' },
    };

    const module = new ModuleInfo(config);
    const result = await module.run(runContext);

    expect(result.vars).toHaveProperty('osInfo.platform');
  });
});
