import type { RecipeSourceGitInterface, RecipeSourceGitInterfaceConfigKey } from './schema.gen';
import { RecipeSourceGitSchema } from './schema';

import type { AbstractRecipeSourceInstance } from '../abstractRecipeSource';
import { AbstractRecipeSource } from '../abstractRecipeSource';
import { recipeSourceRegistryEntryFactory } from '../registry';
import type { Recipe, RecipeCtorContext } from '../../components/recipe';
import { fsPromiseExists, fsPromiseTmpDir, fsPromiseWriteFile } from '../../util/fs';
import { execCmd, ExecCmdErrorThrow } from '../../util/exec';
import path from 'node:path';
import { sha256Hex } from '../../util/crypto';
import { RecipeSourceDir } from '../dir';
import { getErrorPrintfClass } from '../../util/error';
import { lookpath } from 'lookpath';
import type { DataSourceContext } from '../../dataSources/abstractDataSource';

export const RecipeSourceGitRecipeNotFoundOnCheckout = getErrorPrintfClass(
  'RecipeSourceGitRecipeNotFoundOnCheckout',
  'Recipe not found on checkout: %s',
);

export const RecipeSourceGitRecipeNotFound = getErrorPrintfClass(
  'RecipeSourceGitRecipeNotFound',
  'Recipe not found: %s',
);

// Url -> fs path
const gitCloneCache: Record<string, RecipeSourceGitFindRecipeResult> = {};

interface RecipeSourceGitFindRecipeResult {
  ds: AbstractRecipeSourceInstance;
}

export class RecipeSourceGit extends AbstractRecipeSource<RecipeSourceGitInterface, RecipeSourceGitInterfaceConfigKey> {
  // https://terminalroot.com/how-to-clone-only-a-subdirectory-with-git-or-svn/
  async #findRecipe(context: DataSourceContext, id: string): Promise<RecipeSourceGitFindRecipeResult> {
    // Make sure we can use git
    await lookpath('git');

    const url = this.config.url;

    const cacheKey = RecipeSourceGit.#cacheKey(url, id);
    if (this.config.cache) {
      if (cacheKey in gitCloneCache) {
        return gitCloneCache[cacheKey];
      }
    }

    const tmpDir = await fsPromiseTmpDir({ keep: false });
    context.logger.debug(`Checking out ${this.configId} (sparse checkout) into ${tmpDir}`);

    const options = { cwd: tmpDir };
    const execGitCmd = async (...args: string[]) => execCmd(context, 'git', args, options);

    await execGitCmd('init');
    // Track repository, do not enter subdirectory
    await execGitCmd('remote', 'add', '-f', 'origin', url);
    // Enable the tree check feature
    await execGitCmd('config', 'core.sparseCheckout', 'true');

    /*
     *# Create a file in the path: .git/info/sparse-checkout
     *# That is inside the hidden .git directory that was created
     *# by running the command: git init
     *# And inside it enter the name of the sub directory you only want to clone
     *echo 'files' >> .git/info/sparse-checkout
     */
    const sparseCheckoutFile = path.join(tmpDir, '.git', 'info', 'sparse-checkout');
    const recipesPathRoot = this.config.rootPath.replaceAll(path.sep, '/');
    const pathForCheckout = `${recipesPathRoot}/${id}`;
    await fsPromiseWriteFile(sparseCheckoutFile, pathForCheckout, {
      flag: 'a',
      encoding: 'ascii',
    });
    context.logger.debug(`Using sparse checkout path ${pathForCheckout}`);

    try {
      await execGitCmd('pull', 'origin', this.config.ref);
    } catch (ex) {
      /*
       *The failure behavior depends on the git binary itself, it can fail with an error message, or it can
       *succeed and just not pull any file if it just does not exist.
       */
      if (
        ex instanceof ExecCmdErrorThrow &&
        (ex.cause as Error)?.message?.includes('Sparse checkout leaves no entry on working directory')
      ) {
        throw new RecipeSourceGitRecipeNotFoundOnCheckout(id);
      }
      throw ex;
    }

    if (!(await fsPromiseExists(path.join(tmpDir, pathForCheckout)))) {
      throw new RecipeSourceGitRecipeNotFoundOnCheckout(id);
    }

    // Verify that now a recipe exists
    const ds = new RecipeSourceDir({
      workDir: tmpDir,
      trusted: this.wrapperConfig.trusted,
      dir: { path: recipesPathRoot },
    });

    if (!(await ds.has(context, id))) {
      throw new RecipeSourceGitRecipeNotFound(id);
    }

    const result = { ds };
    if (this.config.cache) {
      gitCloneCache[cacheKey] = result;
    }

    return result;
  }

  static #cacheKey(url: string, id: string) {
    const cacheKey = `${sha256Hex(url)}_${sha256Hex(id)}`;
    return cacheKey;
  }

  async has(context: DataSourceContext, id: string): Promise<boolean> {
    try {
      await this.#findRecipe(context, id);
      return true;
    } catch (ex) {
      if (ex instanceof RecipeSourceGitRecipeNotFound) {
        return false;
      }
      throw ex;
    }
  }

  async load(context: RecipeCtorContext, id: string): Promise<Recipe> {
    const result = await this.#findRecipe(context, id);
    const recipe = await result.ds.load(context, id);
    await recipe.validateDependencies(context);
    return recipe;
  }

  protected get configId(): string {
    return `${this.config.url}:${this.config.rootPath}:${this.config.ref}`;
  }
}

recipeSourceRegistryEntryFactory.register(RecipeSourceGitSchema, RecipeSourceGit);
