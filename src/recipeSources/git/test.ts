/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { beforeAll, describe, test } from '@jest/globals';
import type { RecipeSourceGitRecipeNotFound } from './index';
import { RecipeSourceGit, RecipeSourceGitRecipeNotFoundOnCheckout } from './index';
import { newLogger } from '../../util/logger';
import { Recipe } from '../../components/recipe';
import type { ContextLogger, ContextRecipeSourceList, ContextWorkDir } from '../../util/context';
import { execCmd } from '../../util/exec';
import path from 'node:path';
import { fsPromiseCp, fsPromiseMkdir, fsPromiseTmpDir } from '../../util/fs';
import { RecipeSourceGitDefaultRootPath } from './schema';
import { testExamples } from '../../util/testUtils';

const logger = newLogger();
const context: ContextLogger & ContextRecipeSourceList & ContextWorkDir = {
  logger,
  recipeSources: undefined,
  workDir: undefined,
};

interface RecipeSourceGitTest {
  ref: string;

  id: string;
  fail?: string | RegExp | typeof RecipeSourceGitRecipeNotFound;
}

const testAssetsPath = path.join(__dirname, 'test');
const ref = '';

let fakeGitRepo: string;

beforeAll(async () => {
  const tmpDir = await fsPromiseTmpDir({});
  const tmpDirRootPath = path.join(tmpDir, RecipeSourceGitDefaultRootPath);
  await fsPromiseMkdir(tmpDirRootPath);
  await fsPromiseCp(testAssetsPath, tmpDirRootPath, { recursive: true });
  await execCmd(context, 'git', ['init'], { cwd: tmpDir });
  await execCmd(context, 'git', ['config', 'user.email', 'test@kiwi-provider.invalid'], { cwd: tmpDir });
  await execCmd(context, 'git', ['config', 'user.name', 'test'], { cwd: tmpDir });
  await execCmd(context, 'git', ['add', '.'], { cwd: tmpDir });
  await execCmd(context, 'git', ['commit', '-m', 'commit for testing'], { cwd: tmpDir });
  logger.info(`Initialized fake git repo in ${tmpDir}`);
  fakeGitRepo = tmpDir;
});

describe('recipe source git', () => {
  testExamples(__dirname);

  const tests: RecipeSourceGitTest[] = [
    {
      ref,
      id: 'standalone.yaml',
    },
    {
      ref,
      id: 'withdir',
    },
    {
      ref,
      id: 'deeper/wego',
    },
    {
      ref,
      id: 'nonexistent',
      fail: RecipeSourceGitRecipeNotFoundOnCheckout,
    },
  ];

  test.concurrent.each(tests)('$#', async (args: RecipeSourceGitTest) => {
    let ref = args.ref;
    if (ref == '') {
      ref = (await execCmd(context, 'git', ['rev-parse', 'HEAD'], { cwd: fakeGitRepo })).stdout.trim();
    }

    const source = new RecipeSourceGit({
      git: {
        url: fakeGitRepo,
        rootPath: RecipeSourceGitDefaultRootPath,
        ref,
        cache: true,
      },
    });

    if (args.fail) {
      await expect(source.load(context, args.id)).rejects.toThrowError(args.fail);
      return;
    }

    const has = await source.has(context, args.id);
    expect(has, 'ds has recipe').toEqual(true);
    const content = await source.load(context, args.id);
    expect(content).toBeInstanceOf(Recipe);
  });
});
