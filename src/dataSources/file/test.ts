/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, expect, test } from '@jest/globals';
import { DataSourceFile, DataSourceFileErrorFileNotFound, DataSourceFileUnknownFileExtension } from './index';
import path from 'node:path';
import { newLogger } from '../../util/logger';
import type { DataSourceFileInterface } from './schema.gen';
import type { DataSourceContext } from '../abstractDataSource';
import { testExamples } from '../../util/testUtils';

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
  testExamples(__dirname);

  const tests: DataSourceFileTest[] = [
    {
      args: {
        path: 'number.yaml',
        workDir,
      },
      expect: 123,
    },
    {
      args: {
        path: 'number',
        workDir,
      },
      expect: 123,
    },
    {
      args: {
        path: 'object.yaml',
        workDir,
      },
      expect: { myVar: 'hey' },
    },
    {
      args: {
        path: 'nonexistent.yaml',
        workDir,
      },
      failExists: true,
    },
    {
      args: {
        path: 'hmm.whatami',
        workDir,
      },
      failExtension: true,
    },
    {
      args: {
        path: 'hmm.whatami',
        workDir,
        raw: true,
      },
      expect: 'A joke!',
    },
  ];

  test.each(tests)('$#', async (args: DataSourceFileTest) => {
    const source = new DataSourceFile(args.args);

    if (args.failExists) {
      await expect(source.loadVars(context)).rejects.toThrowError(DataSourceFileErrorFileNotFound);
      return;
    }

    if (args.failExtension) {
      await expect(source.loadVars(context)).rejects.toThrowError(DataSourceFileUnknownFileExtension);
      return;
    }

    await source.valid(context);

    const content = await source.loadVars(context);
    expect(content).toEqual(args.expect);
  });
});
