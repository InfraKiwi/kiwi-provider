import '../util/loadAllRegistryEntries.gen';
import type { RecipeSourceList } from '../recipeSources/recipeSourceList';
import { fsPromiseWriteFile, getAllFiles } from '../util/fs';
import { dumpYAML } from '../util/yaml';
import type { RecipeCtorContext } from '../components/recipe';
import { Recipe } from '../components/recipe';
import * as tar from 'tar';
import type { ContextLogger } from '../util/context';
import { Archive } from '../components/archive';

export interface CreateArchiveArgs {
  archiveDir?: string;
  archiveTarFilename?: string;
  configDumpFilename?: string;
  recipesPaths: string[];
  recipeSources?: RecipeSourceList;
}

export async function createArchiveFile(context: ContextLogger, args: CreateArchiveArgs) {
  const recipeCtorContext: RecipeCtorContext = {
    ...context,
    recipeSources: args.recipeSources,
    workDir: undefined,
  };

  const recipes = await Promise.all(args.recipesPaths.map((p) => Recipe.fromPath(recipeCtorContext, p)));
  const archive = await Archive.create(recipeCtorContext, {
    archiveDir: args.archiveDir,
    recipes,
  });

  if (args.archiveTarFilename) {
    const allFiles = await getAllFiles(archive.assetsDir);

    // Write archive for serverConfig
    await tar.c(
      {
        gzip: true,
        cwd: archive.assetsDir,
        file: args.archiveTarFilename,
      },
      allFiles,
    );
  }

  if (args.configDumpFilename) {
    const archiveConfigDump = dumpYAML(archive.config);
    await fsPromiseWriteFile(args.configDumpFilename, archiveConfigDump);
  }
}
