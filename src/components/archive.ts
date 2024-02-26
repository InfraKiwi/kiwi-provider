/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RecipeCtorContext } from './recipe';
import { Recipe } from './recipe';
import path from 'node:path';
import { mkdirp } from 'mkdirp';
import { fsPromiseTmpDir, fsPromiseWriteFile, getAllFiles } from '../util/fs';
import { newLogger } from '../util/logger';
import { RecipeSourceList } from '../recipeSources/recipeSourceList';
import type { ContextLogger, ContextRecipeSourceList, ContextWorkDir } from '../util/context';
import type {
  ArchiveInterface,
  ArchiveRecipeEntryInterface,
  ArchiveRecipesMapInterface,
  CreateArchiveArgsInterface,
  RecipeSourceArchiveInterface,
  RecipeSourceArchiveInterfaceConfigKey,
} from './archive.schema.gen';
import Joi from 'joi';
import {
  ArchiveConfigFilename,
  ArchiveSchema,
  CreateArchiveArgsSchema,
  RecipeSourceArchiveEntryNameRaw,
  RecipeSourceArchiveSchema,
} from './archive.schema';
import type { Inventory, VisitedCache } from './inventory';
import type { DataSourceContext } from '../dataSources/abstractDataSource';
import { AbstractRecipeSource } from '../recipeSources/abstractRecipeSource';
import { recipeSourceRegistryEntryFactory } from '../recipeSources/registry';
import type { RecipeSourceListInterface } from '../recipeSources/recipeSourceList.schema.gen';
import { deepcopy } from '../util/deepcopy';
import { Stats } from '../util/stats';
import { filterHostVarsBlockForHost } from '../util/vars';
import * as tar from 'tar';
import type { InventoryHost } from './inventoryHost';
import type { InventoryInterface } from './inventory.schema.gen';
import { dumpYAML, loadYAMLFromFile } from '../util/yaml';
import { joiAttemptRequired } from '../util/joi';
import type { RecipePhase } from './recipe.schema';
import { normalizePathToUnix } from '../util/path';

interface BuildRecipeDependenciesTreeContext extends ContextLogger, ContextRecipeSourceList, ContextWorkDir {
  includeTestAssets: boolean;
  visitedAssetsDirs: Record<string, string>;
  trusted: boolean;
}

interface GetArchiveForHostResult {
  archive: ArchiveInterface;
  inventory: InventoryInterface;
  stats: Stats;
}

class RecipeSourceArchive extends AbstractRecipeSource<
  RecipeSourceArchiveInterface,
  RecipeSourceArchiveInterfaceConfigKey
> {
  // We directly override the unique id
  protected readonly configId = 'NOOP';

  get uniqueId(): string {
    return this.config.uniqueId;
  }

  async has(context: ContextLogger, id: string): Promise<boolean> {
    return id in this.config.recipesMap;
  }

  async load(context: RecipeCtorContext, id: string): Promise<Recipe> {
    const archiveEntry = this.config.recipesMap[id];
    return await (this.config.archive as Archive).instantiateRecipe(context, id, archiveEntry, this.config.dryRun);
  }
}

recipeSourceRegistryEntryFactory.register(RecipeSourceArchiveSchema, RecipeSourceArchive);

export type GetInstantiatedRootRecipesQuery =
  | {
      ids: string[];
    }
  | {
      phase: RecipePhase;
    };

export class Archive {
  readonly config: ArchiveInterface;
  readonly archiveDir?: string;

  constructor(config: ArchiveInterface, archiveDir?: string) {
    this.config = joiAttemptRequired(config, ArchiveSchema, 'Error validating archive data: ');
    this.archiveDir = archiveDir;
  }

  static async fromDir(archiveDir: string): Promise<Archive> {
    const archiveConfigFile = path.resolve(archiveDir, ArchiveConfigFilename);
    const config = await loadYAMLFromFile(archiveConfigFile);
    const archive = new Archive(config, archiveDir);
    return archive;
  }

  static async fromConfigFile(configFile: string): Promise<Archive> {
    const config = await loadYAMLFromFile(configFile);
    const archive = new Archive(config);
    return archive;
  }

  get #assertArchiveDir(): string {
    if (this.archiveDir == null) {
      throw new Error(`Archive not initialized with archiveDir`);
    }
    return this.archiveDir;
  }

  #compiledRecipeSources?: RecipeSourceList;

  getCompiledRecipeSources(context: DataSourceContext, dryRun: boolean): RecipeSourceList {
    if (this.#compiledRecipeSources) {
      return this.#compiledRecipeSources;
    }

    const recipeSourceListInterface: RecipeSourceListInterface = Object.entries(this.config.recipeSources).map(
      ([id, entry]) => {
        const config: RecipeSourceArchiveInterface = {
          uniqueId: id,
          archive: this,
          recipesMap: entry,
          dryRun,
        };
        return {
          id,
          [RecipeSourceArchiveEntryNameRaw]: config,
        };
      }
    );
    const recipeSources = new RecipeSourceList(context, recipeSourceListInterface);
    this.#compiledRecipeSources = recipeSources;
    return recipeSources;
  }

  async getInstantiatedRootRecipes(
    context: DataSourceContext,
    dryRun: boolean,
    query?: GetInstantiatedRootRecipesQuery
  ) {
    const recipes: Recipe[] = [];

    const ids: string[] = [];
    if (query) {
      if ('ids' in query) {
        ids.push(...query.ids);
      } else if ('phase' in query) {
        ids.push(
          ...Object.keys(this.config.rootRecipes).filter((k) => this.config.rootRecipes[k].phase == query.phase)
        );
      } else {
        throw new Error(`Invalid getInstantiatedRootRecipes query: ${JSON.stringify(query)}`);
      }
    } else {
      // All recipes
      ids.push(...Object.keys(this.config.rootRecipes));
    }

    joiAttemptRequired(
      ids,
      Joi.array().items(Joi.string().valid(...Object.keys(this.config.rootRecipes))),
      'Invalid root recipes ids'
    );
    for (const recipeId of ids) {
      const archiveEntry = this.config.rootRecipes[recipeId];
      if (archiveEntry == null) {
        throw new Error(`Internal error: null archive entry found for recipe id ${recipeId}`);
      }
      const recipe = await this.instantiateRecipe(context, recipeId, archiveEntry, dryRun);
      recipes.push(recipe);
    }
    return recipes;
  }

  // Initializing the recipe will validate all dependencies
  async instantiateRecipe(
    context: DataSourceContext,
    id: string,
    archiveEntry: ArchiveRecipeEntryInterface,
    dryRun: boolean
  ): Promise<Recipe> {
    const recipeCtorContext: RecipeCtorContext = {
      ...context,
      recipeSources: this.getCompiledRecipeSources(context, dryRun),
    };

    let assetsDir: string | undefined;
    // Unpack any assets
    if (!dryRun && archiveEntry.assetsArchive) {
      const fullArchivePath = path.join(this.#assertArchiveDir, archiveEntry.assetsArchive);
      assetsDir = await fsPromiseTmpDir({});
      await tar.x({
        cwd: assetsDir,
        file: fullArchivePath,
      });
      context.logger.debug(`Unpacked temporary recipe ${id} assets into ${assetsDir}`);
    }

    return await Recipe.fromRecipeForArchiveInterface(recipeCtorContext, archiveEntry, {
      id,
      assetsDir,
    });
  }

  async #getRecipeDependenciesChain(
    context: DataSourceContext,
    stats: Stats,
    archive: ArchiveInterface,
    dependenciesBySource: Record<string, Record<string, Recipe>>,
    dependenciesBySourceArchiveConfigs: Record<string, ArchiveRecipesMapInterface>,
    recipe: Recipe,
    dryRun: boolean
  ): Promise<void> {
    // We want to collect all possible dependencies and add them to the archive for the host
    const recipeDeps = await recipe.validateDependencies(context);
    for (const recipeId in recipeDeps) {
      const source = recipeDeps[recipeId];
      const sourceId = source.uniqueId;
      if (!(sourceId in dependenciesBySource)) {
        dependenciesBySource[sourceId] = {};
        dependenciesBySourceArchiveConfigs[sourceId] = {};
      }
      const depRecipeConfig = archive.recipeSources[sourceId][recipeId];
      const depRecipe = await stats.measureBlock(context, `dependency recipe init: ${recipeId}`, () =>
        this.instantiateRecipe(context, recipeId, depRecipeConfig, dryRun)
      );
      dependenciesBySource[sourceId][recipeId] = depRecipe;
      dependenciesBySourceArchiveConfigs[sourceId][recipeId] = {
        ...depRecipeConfig,
        targets: undefined,
        config: { ...depRecipeConfig.config },
      };

      // Loop down the chain
      await this.#getRecipeDependenciesChain(
        context,
        stats,
        archive,
        dependenciesBySource,
        dependenciesBySourceArchiveConfigs,
        depRecipe,
        dryRun
      );
    }
  }

  async getArchiveForHostname(
    context: DataSourceContext,
    inventory: Inventory,
    hostname: string,
    visitedCache: VisitedCache = { groups: {} }
  ): Promise<GetArchiveForHostResult> {
    const stats = new Stats();

    const host = await stats.measureBlock(context, 'host data loading', () =>
      inventory.getHostAndLoadVars(context, hostname)
    );
    const archive: ArchiveInterface = deepcopy(this.config);

    // Keep only the vars related to the specified host
    for (const recipeId in archive.rootRecipes) {
      const blockVars = filterHostVarsBlockForHost(host, archive.rootRecipes[recipeId].config);
      Object.assign(archive.rootRecipes[recipeId].config, blockVars);
    }

    for (const key in archive.recipeSources) {
      const recipes = archive.recipeSources[key];
      for (const recipeId in recipes) {
        const blockVars = filterHostVarsBlockForHost(host, recipes[recipeId].config);
        Object.assign(recipes[recipeId].config, blockVars);
      }
    }

    const rootRecipesForHost = Object.keys(archive.rootRecipes)
      // Filter only recipes that target the current host
      .filter((key) => {
        const r = archive.rootRecipes[key];
        if (r.targets == null) {
          return false;
        }
        const hosts = inventory.getHostsByPattern(context, r.targets, undefined, visitedCache);
        return r.targets.length > 0 && hostname in hosts;
      });

    // Load all other hosts we need to load
    const otherHostsPatterns = Array.from(
      new Set(rootRecipesForHost.map((recipeId) => archive.rootRecipes[recipeId].otherHosts ?? []).flat())
    );

    const otherHosts: Record<string, InventoryHost> = {};
    for (const pattern of otherHostsPatterns) {
      const hosts = inventory.getHostsByPattern(context, pattern, undefined, visitedCache);
      for (const hostname in hosts) {
        const host = hosts[hostname];
        await host.loadVars(context);
        otherHosts[hostname] = host;
      }
    }

    const rootRecipes: Record<string, Recipe> = {};
    const rootRecipesArchiveConfigs: ArchiveRecipesMapInterface = {};

    const dependenciesBySource: Record<string, Record<string, Recipe>> = {};
    const dependenciesBySourceArchiveConfigs: Record<string, ArchiveRecipesMapInterface> = {};

    for (const rootRecipeId of rootRecipesForHost) {
      const archiveEntry = archive.rootRecipes[rootRecipeId];

      const recipe = await stats.measureBlock(context, `root recipe init: ${rootRecipeId}`, () =>
        this.instantiateRecipe(context, rootRecipeId, archiveEntry, true)
      );
      rootRecipes[rootRecipeId] = recipe;
      rootRecipesArchiveConfigs[rootRecipeId] = {
        ...archiveEntry,
        targets: undefined,
        config: { ...archiveEntry.config },
      };

      await this.#getRecipeDependenciesChain(
        context,
        stats,
        archive,
        dependenciesBySource,
        dependenciesBySourceArchiveConfigs,
        recipe,
        true
      );
    }

    archive.rootRecipes = rootRecipesArchiveConfigs;
    archive.recipeSources = dependenciesBySourceArchiveConfigs;

    joiAttemptRequired(archive, ArchiveSchema, 'Failed to validate archive for host: ');

    const subInventory = await inventory.createRawSubInventoryConfig(context, [host.id, ...Object.keys(otherHosts)]);

    return {
      inventory: subInventory,
      archive,
      stats,
    };
  }

  static async create(context: RecipeCtorContext, args: CreateArchiveArgsInterface): Promise<Archive> {
    args = joiAttemptRequired(args, CreateArchiveArgsSchema, 'Failed to validate Archive.create args: ');

    const { logger = newLogger() } = context;

    const archiveDir = args.archiveDir ?? (await fsPromiseTmpDir({ keep: true }));

    logger.info(`Creating archive at ${archiveDir}`, args);

    const archiveConfig: ArchiveInterface = {
      rootRecipes: {},
      recipeSources: {},

      // Later
      timestamp: 0,
    };

    // Make sure the recipes are conformant
    for (const recipe of args.recipes) {
      if (recipe.standaloneId == null) {
        throw new Error(`Found recipe with missing id: ${JSON.stringify(recipe)}`);
      }
    }

    const buildRecipeDependenciesTreeContext: BuildRecipeDependenciesTreeContext = {
      ...context,
      includeTestAssets: args.includeTestAssets ?? false,
      visitedAssetsDirs: {},
      trusted: true,
    };

    for (const recipe of args.recipes) {
      logger.debug(`Processing recipe ${recipe.fullId}`);
      await generateRecipeForArchiveEntry(buildRecipeDependenciesTreeContext, archiveConfig, recipe, false, archiveDir);
    }

    archiveConfig.timestamp = new Date().getTime();
    logger.info('archive', archiveConfig);

    const archiveConfigDump = dumpYAML(archiveConfig);
    const archiveConfigFileName = path.join(archiveDir, ArchiveConfigFilename);
    await fsPromiseWriteFile(archiveConfigFileName, archiveConfigDump);

    const archive = new Archive(archiveConfig, archiveDir);

    logger.info(`Archive (version ${archive.config.timestamp}) created at ${archiveConfigFileName}`);

    return archive;
  }

  async saveToTarArchive(fileName: string) {
    const allFiles = await getAllFiles(this.#assertArchiveDir);

    // Write archive for kiwiProvider
    await tar.c(
      {
        gzip: true,
        cwd: this.archiveDir,
        file: fileName,
      },
      allFiles
    );
  }
}

export async function generateRecipeForArchiveEntry(
  context: BuildRecipeDependenciesTreeContext,
  archive: ArchiveInterface,
  recipe: Recipe,
  isDependency: boolean,
  archiveDir: string
): Promise<void> {
  context.logger.debug(`generateRecipeForArchiveEntry: ${recipe.fullId}`);
  const recipeForArchive = await recipe.getConfigForArchive({
    isDependency,
    keepVars: context.trusted,
  });

  const recipeId = recipe.standaloneId;
  if (recipeId == null) {
    throw new Error(`Dependency recipe found with unknown id: ${recipeId}`);
  }

  const assetsArchive = recipe.meta?.fileName ? await archiveRecipeAssets(context, recipe, archiveDir) : undefined;
  const dependenciesBySourceId = await buildRecipeDependenciesTree(context, archive, recipe, archiveDir);

  for (const sourceId in dependenciesBySourceId) {
    const deps = dependenciesBySourceId[sourceId];
    for (const dep of deps) {
      recipeForArchive.config.dependencies ??= {};
      recipeForArchive.config.dependencies[dep] = { sourceId };
    }
  }

  const entry: ArchiveRecipeEntryInterface = {
    ...recipeForArchive,
    assetsArchive,
  };

  if (isDependency) {
    const sourceId = recipe.meta?.recipeSource?.uniqueId;
    if (sourceId == null) {
      throw new Error(`Failed to find recipe source id for dependency recipe '${recipeId}'`);
    }
    archive.recipeSources[sourceId] ??= {};
    if (recipeId in archive.recipeSources) {
      throw new Error(`Recipe with id '${recipeId}' already present in source ${sourceId}`);
    }
    archive.recipeSources[sourceId][recipeId] = entry;
  } else {
    if (recipeId in archive.rootRecipes) {
      throw new Error(`Root recipe with id '${recipeId}' already present`);
    }
    archive.rootRecipes[recipeId] = entry;
  }
}

async function buildRecipeDependenciesTree(
  context: BuildRecipeDependenciesTreeContext,
  archive: ArchiveInterface,
  parentRecipe: Recipe,
  archiveDir: string
): Promise<Record<string, string[]>> {
  context.logger.debug(`buildRecipeDependenciesTree: ${parentRecipe.fullId}`);

  const deps: Record<string, string[]> = {};
  for (const id in parentRecipe.config.dependencies) {
    const dependencyArg = Recipe.normalizeDependencyArg(parentRecipe.config.dependencies[id]);

    let recipeSources: RecipeSourceList | undefined = context.recipeSources;
    if (parentRecipe.recipeSources) {
      recipeSources = recipeSources
        ? RecipeSourceList.mergePrepend(context, parentRecipe.recipeSources, recipeSources)
        : parentRecipe.recipeSources;
    }

    if (recipeSources == null) {
      throw new Error('No recipe sources defined');
    }

    const contextWithSources: BuildRecipeDependenciesTreeContext = {
      ...context,
      recipeSources,
    };

    const recipe = await contextWithSources.recipeSources!.findAndLoadRecipe(context, id, dependencyArg);
    if (recipe.meta?.recipeSource == null) {
      throw new Error('Recipe source not defined in meta');
    }

    const depsContext: BuildRecipeDependenciesTreeContext = {
      ...contextWithSources,
      // This way, even if someone down the chain declares a trusted source, we'll treat is as not trusted
      trusted: (contextWithSources.trusted ?? true) && recipe.meta.recipeSource.wrapperConfig.trusted == true,
    };

    await generateRecipeForArchiveEntry(depsContext, archive, recipe, true, archiveDir);

    const sourceId = recipe.meta.recipeSource.uniqueId;
    if (sourceId == null) {
      throw new Error(`Recipe source id is null for recipe ${id}, dependency of ${parentRecipe.fullId}`);
    }
    const recipeId = recipe.standaloneId;
    if (recipeId == null) {
      throw new Error(`Recipe id is null for recipe ${id}, dependency of ${parentRecipe.fullId}`);
    }

    deps[sourceId] ??= [];
    deps[sourceId].push(recipeId);
  }
  return deps;
}

let copyAssetsCounter = 0;

async function archiveRecipeAssets(
  context: BuildRecipeDependenciesTreeContext,
  recipe: Recipe,
  archiveDir: string
): Promise<string | undefined> {
  const recipeId = recipe.standaloneId!;
  if (recipe.meta.fileName == null) {
    return;
  }

  const assetsDirs = (await recipe.getAssetsDirs(context.includeTestAssets)) ?? [];
  if (assetsDirs.length == 0) {
    return;
  }

  const assetsDirsHash = JSON.stringify(assetsDirs);
  if (assetsDirsHash in context.visitedAssetsDirs) {
    return context.visitedAssetsDirs[assetsDirsHash];
  }

  const tmpAssetsDir = await recipe.temporaryCloneAssets(context);
  if (tmpAssetsDir == null) {
    // After evaluating the asset dirs, there were no files to copy
    return;
  }

  const assetsRootDir = path.join(archiveDir, 'assets');
  await mkdirp(assetsRootDir);

  const counterPadded = (copyAssetsCounter++).toString(10).padStart(4, '0');
  const archiveFile = path.join(assetsRootDir, `${counterPadded}_${Recipe.cleanId(recipeId).slice(-16)}.tar.gz`);

  const files = await getAllFiles(tmpAssetsDir);
  await tar.c(
    {
      gzip: true,
      cwd: tmpAssetsDir,
      file: archiveFile,
    },
    files
  );
  const relative = normalizePathToUnix(path.relative(archiveDir, archiveFile));

  context.visitedAssetsDirs[assetsDirsHash] = relative;
  return relative;
}
