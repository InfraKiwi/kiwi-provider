/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RecipeSourceDirInterface, RecipeSourceDirInterfaceConfigKey } from './schema.gen';
import { RecipeSourceDirSchema } from './schema';

import { AbstractRecipeSource } from '../abstractRecipeSource';
import { recipeSourceRegistryEntryFactory } from '../registry';
import type { RecipeCtorContext } from '../../components/recipe';
import { Recipe } from '../../components/recipe';
import { fsPromiseExists, fsPromiseReadDir, fsPromiseStat } from '../../util/fs';
import path from 'node:path';
import { DataSourceFile } from '../../dataSources/file';
import type { Stats } from 'node:fs';
import type { RecipeInterface } from '../../components/recipe.schema.gen';
import { getErrorPrintfClass } from '../../util/error';
import type { DataSourceContext } from '../../dataSources/abstractDataSource';
import type { ContextWorkDir } from '../../util/context';
import { getAvailableFileLoadersExtensions } from '../../dataSources/file/schema';

const availableExtensions = getAvailableFileLoadersExtensions();

export const RecipeSourceDirErrorDirNotFound = getErrorPrintfClass(
  'RecipeSourceDirErrorDirNotFound',
  'Provided recipes source path does not exist: %s'
);
export const RecipeSourceDirErrorNotADir = getErrorPrintfClass(
  'RecipeSourceDirErrorNotADir',
  'Provided path is not a directory: %s'
);
export const RecipeSourceDirRecipeNotFound = getErrorPrintfClass(
  'RecipeSourceDirRecipeNotFound',
  'Could not find suitable file or directory for recipe: %s'
);

interface IdParts {
  id: string;
  subDirParts: string[];
}

export class RecipeSourceDir extends AbstractRecipeSource<RecipeSourceDirInterface, RecipeSourceDirInterfaceConfigKey> {
  #getFullPath(context: ContextWorkDir): string {
    if (path.isAbsolute(this.config.path)) {
      return this.config.path;
    }

    const workDir = this.wrapperConfig.workDir ?? context.workDir;
    return path.resolve(workDir ? path.join(workDir, this.config.path) : this.config.path);
  }

  async #findRecipe(context: ContextWorkDir, idParts: IdParts): Promise<string | null> {
    const fullPath = path.resolve(this.#getFullPath(context), ...idParts.subDirParts);

    if (!(await fsPromiseExists(fullPath))) {
      throw new RecipeSourceDirErrorDirNotFound(fullPath);
    }

    const dirStat = await fsPromiseStat(fullPath);
    if (!dirStat.isDirectory()) {
      throw new RecipeSourceDirErrorNotADir(fullPath);
    }

    const files = await fsPromiseReadDir(fullPath);
    const possibleFiles = files
      .filter((f) => {
        if (path.basename(f) == idParts.id) {
          return true;
        }
        const ext = path.extname(f);
        if (ext != '' && !availableExtensions.includes(ext)) {
          return false;
        }
        const base = path.basename(f, ext);
        return base == idParts.id;
      })
      .map((f) => path.join(fullPath, f));

    // Possible files are dirs containing a main.yaml file, or standalone recipe.yaml files
    const stats = await Promise.all(
      possibleFiles.map(async (f): Promise<[string, Stats]> => [f, await fsPromiseStat(f)])
    );
    for (const [f, stat] of stats) {
      if (!stat.isDirectory()) {
        return f;
      }

      // Try to find a suitable main file
      for (const ext of availableExtensions) {
        const mainFile = path.join(f, `main${ext}`);
        if (await fsPromiseExists(mainFile)) {
          return mainFile;
        }
      }
    }

    return null;
  }

  static #getIdParts(id: string): IdParts {
    const split = id.split('/');
    return {
      id: split[split.length - 1],
      subDirParts: split.length > 1 ? split.slice(0, -1) : [],
    };
  }

  async has(context: DataSourceContext, id: string): Promise<boolean> {
    const idParts = RecipeSourceDir.#getIdParts(id);
    try {
      const recipe = await this.#findRecipe(context, idParts);
      return recipe != null;
    } catch (ex) {
      if (ex instanceof RecipeSourceDirErrorDirNotFound || ex instanceof RecipeSourceDirErrorNotADir) {
        return false;
      }
      throw ex;
    }
  }

  async load(context: RecipeCtorContext, id: string): Promise<Recipe> {
    const idParts = RecipeSourceDir.#getIdParts(id);
    const file = await this.#findRecipe(context, idParts);
    if (file == null) {
      throw new RecipeSourceDirRecipeNotFound(id);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await new DataSourceFile({ path: file }).loadVars(context)) as any;
    if (data == null) {
      throw new Error(`Empty recipe found at ${file}`);
    }
    const recipe = new Recipe(context, data as RecipeInterface, {
      id: id,
      fileName: file,
      recipeSource: this,
    });
    await recipe.validateDependencies(context);
    return recipe;
  }

  protected get configId(): string {
    return JSON.stringify(this.config);
  }
}

recipeSourceRegistryEntryFactory.register(RecipeSourceDirSchema, RecipeSourceDir);
