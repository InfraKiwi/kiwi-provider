import { describe, expect, test } from '@jest/globals';
import {
  RecipeSourceDir,
  RecipeSourceDirErrorDirNotFound,
  RecipeSourceDirErrorNotADir,
  RecipeSourceDirRecipeNotFound,
} from './index';
import path from 'node:path';
import { newLogger } from '../../util/logger';
import { Recipe } from '../../components/recipe';
import type { ContextLogger, ContextRecipeSourceList, ContextWorkDir } from '../../util/context';
import { testExamples } from '../../util/testUtils';

const logger = newLogger();
const context: ContextLogger & ContextRecipeSourceList & ContextWorkDir = {
  logger,
  recipeSources: undefined,
  workDir: undefined,
};

interface RecipeSourceDirTest {
  dir: string;
  workDir?: string;
  id: string;
  fail?: string | RegExp | typeof RecipeSourceDirErrorNotADir;
}

const dir = path.resolve(__dirname, 'test');

describe('recipe source dir', () => {
  testExamples(__dirname);

  const tests: RecipeSourceDirTest[] = [
    {
      dir,
      id: 'standalone',
    },
    {
      dir,
      id: 'standalone.yaml',
    },
    {
      dir,
      id: 'empty',
      fail: 'Empty',
    },
    {
      dir,
      id: 'empty.yaml',
      fail: 'Empty',
    },
    {
      dir,
      id: 'withdir',
    },
    {
      dir,
      id: 'withdir/another',
    },
    {
      dir,
      id: 'withdir/another.yaml',
    },
    {
      dir: path.join(dir, 'withdir'),
      id: './another.yaml',
    },
    {
      dir: path.join(dir, 'withdir'),
      id: './another',
    },
    {
      dir,
      id: 'deeper/wego',
    },
    {
      dir,
      id: 'nonexistent',
      fail: RecipeSourceDirRecipeNotFound,
    },
    {
      dir: 'nonexistentforsure',
      id: 'nonexistent',
      fail: RecipeSourceDirErrorDirNotFound,
    },
    {
      dir: path.join(dir, 'standalone.yaml'),
      id: 'nonexistent',
      fail: RecipeSourceDirErrorNotADir,
    },
    {
      dir: '..',
      id: 'deeper/wego',
      workDir: path.join(dir, 'withdir'),
    },
    {
      dir: '..',
      id: 'withdir',
      workDir: path.join(dir, 'withdir'),
    },
    {
      dir: '..',
      id: 'withdir/another.yaml',
      workDir: path.join(dir, 'withdir'),
    },
    {
      dir: '..',
      id: 'deeper/wego/second.yaml',
      workDir: path.join(dir, 'withdir'),
    },
  ];

  test.each(tests)('$#', async (args: RecipeSourceDirTest) => {
    const source = new RecipeSourceDir({
      dir: { path: args.dir },
      workDir: args.workDir,
    });

    if (args.fail) {
      await expect(source.load(context, args.id)).rejects.toThrowError(args.fail);
      return;
    }

    const has = await source.has(context, args.id);
    expect(has).toEqual(true);
    const content = await source.load(context, args.id);
    expect(content).toBeInstanceOf(Recipe);
  });
});
