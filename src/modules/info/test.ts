import { newDebug } from '../../util/debug';
import { describe, expect, test } from '@jest/globals';
import { ModuleInfo } from './index';

import { getTestRunContext } from '../../components/inventory.testutils';
import type { ModuleInfoInterface } from './gen.schema.gen';

const debug = newDebug(__filename);

describe('info module', () => {
  test('get osInfo', async () => {
    const runContext = getTestRunContext();

    const config: ModuleInfoInterface = {
      osInfo: {},
      // inetChecksite: { url: 'https://google.com' },
    };

    const module = new ModuleInfo(config);
    const result = await module.run(runContext);

    expect(result.vars).toHaveProperty('osInfo.platform');
  });
});
