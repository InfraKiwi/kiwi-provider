import { describe, expect, test } from '@jest/globals';
import { DataSourceFile, DataSourceFileErrorFileNotFound, DataSourceFileUnknownFileExtension } from './index';
import path from 'node:path';
import { newLogger } from '../../util/logger';
import type { DataSourceFileInterface } from './schema.gen';
import type { DataSourceContext } from '../abstractDataSource';

const logger = newLogger();
const context: DataSourceContext = {
  logger,
  workDir: undefined,
};

interface DataSourceFileTest {
  args: DataSourceFileInterface;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect?: any;
  failExists?: boolean;
  failExtension?: boolean;
}

const workDir = path.resolve(__dirname, 'test');

describe('data source file', () => {
  const tests: DataSourceFileTest[] = [
    {
      args: { path: 'number.yaml', workDir },
      expect: 123,
    },
    {
      args: { path: 'number', workDir },
      expect: 123,
    },
    {
      args: { path: 'object.yaml', workDir },
      expect: { myVar: 'hey' },
    },
    {
      args: { path: 'nonexistent.yaml', workDir },
      failExists: true,
    },
    {
      args: { path: 'hmm.whatami', workDir },
      failExtension: true,
    },
    {
      args: { path: 'hmm.whatami', workDir, raw: true },
      expect: 'A joke!',
    },
  ];

  test.each(tests)('$#', async (args: DataSourceFileTest) => {
    const source = new DataSourceFile(args.args);

    if (args.failExists) {
      await expect(source.load(context)).rejects.toThrowError(DataSourceFileErrorFileNotFound);
      return;
    }

    if (args.failExtension) {
      await expect(source.load(context)).rejects.toThrowError(DataSourceFileUnknownFileExtension);
      return;
    }

    await source.valid(context);

    const content = await source.load(context);
    expect(content).toEqual(args.expect);
  });
});
