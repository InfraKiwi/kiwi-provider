import { describe, expect, test } from '@jest/globals';
import { MultiDataSourceGlob } from './index';
import path from 'node:path';
import { newLogger } from '../../util/logger';

import type { DataSourceContext } from '../abstractDataSource';
import { testExamples } from '../../util/testUtils';

const logger = newLogger();
const context: DataSourceContext = {
  logger,
  workDir: undefined,
};

describe('data source glob', () => {
  testExamples(__dirname);

  test('gets the right files', async () => {
    const source = new MultiDataSourceGlob({
      pattern: '*.yaml',
      workDir: path.resolve(__dirname, 'test'),
    });
    const files = await source.listEntries(context);

    expect(files).toEqual(['host-1.yaml', 'host-2.yaml']);

    const hosts = await source.loadAllEntries(context);

    const host1 = hosts['host-1.yaml'];
    const host2 = hosts['host-2.yaml'];

    expect(host1).toEqual({ myVar: 1 });
    expect(host2).toEqual({ myVar: 2 });
  });
});
