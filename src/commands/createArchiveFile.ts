/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import '../util/loadAllRegistryEntries.gen';
import type { RecipeSourceList } from '../recipeSources/recipeSourceList';
import { fsPromiseWriteFile } from '../util/fs';
import type { RecipeCtorContext } from '../components/recipe';
import { Recipe } from '../components/recipe';
import type { ContextLogger, ContextWorkDir } from '../util/context';
import { Archive } from '../components/archive';

import { dumpYAML } from '../util/yaml';

export interface CreateArchiveArgs {
  archiveDir?: string;
  archiveTarFilename?: string;
  configDumpFilename?: string;
  recipesPaths: string[];
  recipeSources?: RecipeSourceList;
}

export async function createArchiveFile(context: ContextLogger & ContextWorkDir, args: CreateArchiveArgs) {
  const recipeCtorContext: RecipeCtorContext = {
    ...context,
    recipeSources: args.recipeSources,
  };

  const recipes = await Promise.all(args.recipesPaths.map((p) => Recipe.fromPath(recipeCtorContext, p)));
  const archive = await Archive.create(recipeCtorContext, {
    archiveDir: args.archiveDir,
    recipes,
  });

  if (args.archiveTarFilename) {
    await archive.saveToTarArchive(args.archiveTarFilename);
  }

  if (args.configDumpFilename) {
    const archiveConfigDump = dumpYAML(archive.config);
    await fsPromiseWriteFile(args.configDumpFilename, archiveConfigDump);
  }

  return archive;
}
