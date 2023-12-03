import { newDebug } from '../util/debug';
import type { RunContext } from '../util/runContext';
import { RecipeMinimalSchema, RecipeSchema, RecipeTestMockSchema } from './recipe.schema';
import type {
  RecipeDependencyInterface,
  RecipeDependencyWithAlternativesInterface,
  RecipeForArchiveInterface,
  RecipeInterface,
  RecipeMinimalInterface,
  RecipeTestMockInterface,
} from './recipe.schema.gen';
import { extractAllTemplates } from '../util/tpl';
import type { VarsInterface } from './varsContainer.schema.gen';
import { Task } from './task';
import path from 'node:path';
import { fsPromiseExists, fsPromiseStat } from '../util/fs';

import type { InventoryHost } from './inventoryHost';
import { DataSourceFile } from '../dataSources/file';
import type { DataSourceContext } from '../dataSources/abstractDataSource';
import { RecipeSourceList } from '../recipeSources/recipeSourceList';
import type { AbstractRecipeSourceInstance } from '../recipeSources/abstractRecipeSource';
import type { ContextLogger, ContextRecipeSourceList, ContextWorkDir } from '../util/context';
import { joiKeepOnlyKeysInJoiSchema, joiKeepOnlyKeysNotInJoiObjectDiff } from '../util/joi';
import Joi from 'joi';
import { getErrorPrintfClass } from '../util/error';
import type { RegistryEntry } from '../util/registry';
import { moduleRegistry } from '../modules/registry';
import { TestMockBaseSchema } from './testingCommon.schema';
import type { AbstractModuleBaseInstance } from '../modules/abstractModuleBase';
import { TestMock } from './testingCommon';
import type { ConditionSetInterface } from './testingCommon.schema.gen';

const debug = newDebug(__filename);

export interface RecipeCtorContext extends ContextLogger, ContextRecipeSourceList, ContextWorkDir {}

export const RecipeErrorInputValidationFailed = getErrorPrintfClass(
  'RecipeErrorInputValidationFailed',
  'The input variable "%s" does not satisfy the required validation rule',
);

export interface RecipeRunResult {
  vars: VarsInterface;
  changed: boolean;
}

export interface RecipeMetadata {
  id?: string;
  fileName?: string;
  assetsDir?: string;
  recipeSource?: AbstractRecipeSourceInstance;
}

export interface RecipeGetConfigForArchiveArgs {
  isDependency?: boolean;
  keepVars?: boolean;
}

export class RecipeTestMock extends TestMock {
  #module: RegistryEntry;

  constructor(config: RecipeTestMockInterface) {
    config = Joi.attempt(config, RecipeTestMockSchema);
    const module = moduleRegistry.findRegistryEntryFromIndexedConfig(config, RecipeTestMockSchema);

    const conditions = config[module.entryName] as ConditionSetInterface;
    super(joiKeepOnlyKeysInJoiSchema(config, TestMockBaseSchema), conditions);
    this.#module = module;
  }

  matchesModule(context: DataSourceContext, module: AbstractModuleBaseInstance): boolean {
    if (module.registryEntry.entryName != this.#module.entryName) {
      return false;
    }
    return super.matchesModuleConfig(context, module);
  }
}

export class Recipe {
  readonly config: RecipeInterface;
  readonly meta?: RecipeMetadata;

  readonly #tasks: Task[] = [];
  readonly #testMocks: RecipeTestMock[] = [];
  readonly #recipeSources?: RecipeSourceList;
  readonly #recipeSourcesCombinedWithMinimal?: RecipeSourceList;

  constructor(context: RecipeCtorContext, config: RecipeInterface, meta?: RecipeMetadata) {
    this.config = Joi.attempt(config, RecipeSchema, 'validate recipe config');
    this.meta = meta;

    this.config.vars = extractAllTemplates(this.config.vars);
    this.config.hostVars = extractAllTemplates(this.config.hostVars);
    this.config.groupVars = extractAllTemplates(this.config.groupVars);
    this.#tasks = this.config.tasks.map((taskInterface) => new Task(extractAllTemplates(taskInterface)));

    // TODO template this?
    this.#testMocks = (this.config.testMocks ?? []).map((mockConfig) => new RecipeTestMock(mockConfig));

    const recipeSourceContext: RecipeCtorContext = {
      ...context,
      workDir: meta?.fileName ? path.dirname(meta.fileName) : undefined,
    };

    const newRecipeSources = this.config.recipeSources
      ? new RecipeSourceList(recipeSourceContext, this.config.recipeSources)
      : undefined;
    this.#recipeSources = newRecipeSources;
    this.#recipeSourcesCombinedWithMinimal = this.#getCombinedRecipeSources(recipeSourceContext);
  }

  #getMinimalRecipeSources(context: RecipeCtorContext): RecipeSourceList {
    return new RecipeSourceList(context, [{ dir: { path: '.' } }]);
  }

  #validateDependenciesCache?: Record<string, AbstractRecipeSourceInstance>;

  async validateDependencies(context: DataSourceContext): Promise<Record<string, AbstractRecipeSourceInstance>> {
    if (this.#validateDependenciesCache) {
      return this.#validateDependenciesCache;
    }
    if (this.config.dependencies == null || Object.keys(this.config.dependencies).length == 0) {
      return {};
    }
    if (this.#recipeSourcesCombinedWithMinimal == null) {
      throw new Error('The recipe has some dependencies defined but no recipe source can be found');
    }

    const resolvedDependencies: Record<string, AbstractRecipeSourceInstance> = {};
    for (const id in this.config.dependencies) {
      const val = Recipe.normalizeDependencyArg(this.config.dependencies[id]);

      // Make sure the recipe exists in the source
      const source = await this.#recipeSourcesCombinedWithMinimal.findSourceForRecipe(context, id, val);
      resolvedDependencies[id] = source;
    }
    this.#validateDependenciesCache = resolvedDependencies;
    return resolvedDependencies;
  }

  async getConfigForArchive(args: RecipeGetConfigForArchiveArgs): Promise<RecipeForArchiveInterface> {
    // Strip out unnecessary items
    const cleanedConfig: RecipeMinimalInterface = {
      ...joiKeepOnlyKeysNotInJoiObjectDiff(this.config, RecipeMinimalSchema, RecipeSchema),
      // Strip some data
      tasks: this.#tasks.map((t) => t.getConfigForArchive()),
    };

    if (!args.keepVars) {
      cleanedConfig.groupVars = undefined;
      cleanedConfig.hostVars = undefined;
    }

    return {
      targets: args.isDependency ? undefined : this.config.targets,
      otherHosts: args.isDependency ? undefined : this.config.otherHosts,
      config: cleanedConfig,
    };
  }

  static async fromPath(context: RecipeCtorContext, p: string): Promise<Recipe> {
    // Are we looking at a directory?
    if ((await fsPromiseExists(p)) && (await fsPromiseStat(p)).isDirectory()) {
      return Recipe.fromPath(context, path.join(p, 'main'));
    }

    const ds = new DataSourceFile({ path: p });
    const fileName = await ds.findValidFilePath(context);
    const data = await ds.load(context);
    if (data == null) {
      throw new Error(`Empty recipe found at ${fileName}`);
    }
    const id = context.workDir == null ? undefined : fileName.replace(context.workDir + path.sep, '');
    const recipe = new Recipe(context, data as RecipeInterface, {
      fileName,
      id,
    });
    await recipe.validateDependencies(context);
    return recipe;
  }

  static async fromRecipeForArchiveInterface(
    context: RecipeCtorContext,
    entry: RecipeForArchiveInterface,
    meta: RecipeMetadata,
  ): Promise<Recipe> {
    const recipe = new Recipe(
      context,
      {
        ...entry.config,
        targets: entry.targets,
        otherHosts: entry.otherHosts,
      },
      meta,
    );
    await recipe.validateDependencies(context);
    return recipe;
  }

  static normalizeDependencyArg(arg: RecipeDependencyWithAlternativesInterface): RecipeDependencyInterface {
    if (arg == null) {
      return {};
    }
    if (typeof arg == 'string') {
      return {
        version: arg,
      };
    }
    return arg;
  }

  get taskCount(): number {
    return this.#tasks.length;
  }

  get targets(): string[] {
    return this.config.targets ?? [];
  }

  static cleanId(input: string): string {
    return input.replace(/\W/g, '_');
  }

  get standaloneId(): string | undefined {
    const baseId = this.meta?.id ?? this.meta?.fileName;
    if (baseId == undefined) {
      return;
    }
    return Recipe.cleanId(baseId);
  }

  get fullId(): string | null {
    const recipeStandaloneId = this.standaloneId;
    if (recipeStandaloneId == null) {
      return null;
    }

    if (this.meta?.recipeSource == null) {
      return recipeStandaloneId;
    }

    return `${this.meta.recipeSource.id}_${recipeStandaloneId}`;
  }

  #getCombinedRecipeSources(context: RecipeCtorContext): RecipeSourceList | undefined {
    /*
    1. Local dir
    2. Local sources
    3. Ctx sources
     */

    const minimalRecipeSources = this.#getMinimalRecipeSources(context);
    const minimalPlusLocal = this.#recipeSources
      ? RecipeSourceList.mergePrepend(context, this.#recipeSources, minimalRecipeSources)
      : minimalRecipeSources;

    if (this.config.ignoreContextSources || context.recipeSources == null) {
      return minimalPlusLocal;
    }

    if (minimalPlusLocal == null) {
      return context.recipeSources;
    }
    return RecipeSourceList.mergePrepend(context, minimalPlusLocal, context.recipeSources);
  }

  get recipeSources(): RecipeSourceList | undefined {
    return this.#recipeSources;
  }

  async getAssetsDir(): Promise<string | undefined> {
    if (this.meta?.assetsDir) {
      return this.meta.assetsDir;
    }

    const dirName = this.meta?.fileName ? path.dirname(this.meta.fileName) : undefined;
    if (dirName == null) {
      return;
    }
    const assetsDir = path.join(dirName, 'assets');

    if (!(await fsPromiseExists(assetsDir)) || !(await fsPromiseStat(assetsDir)).isDirectory()) {
      return;
    }

    return assetsDir.replaceAll(path.sep, '/');
  }

  #validateInputsOrThrow(vars: VarsInterface) {
    if (this.config.inputs == null) {
      return;
    }
    for (const key in this.config.inputs) {
      const validation = this.config.inputs[key];
      let schema: Joi.Schema;
      if (typeof validation == 'string') {
        const isOptional = validation.endsWith('?');
        const typeKey = isOptional ? validation.substring(0, validation.length - 1) : validation;
        schema = Joi.types()[typeKey as keyof typeof Joi.types] as Joi.Schema;
        if (!isOptional) {
          schema = schema.required();
        }
      } else {
        schema = validation as Joi.Schema;
      }
      const varValue = vars[key];
      const validationResult = schema.validate(varValue);
      if (validationResult.error) {
        throw new RecipeErrorInputValidationFailed(key);
      }
    }
  }

  async run(
    context: RunContext,
    // If provided, use these pre-aggregated vars instead of performing
    // the aggregation at runtime. Use case: compile
    aggregatedVars?: VarsInterface,
  ): Promise<RecipeRunResult> {
    context = context
      .clone({
        // Here we use the combined sources without minimal because the minimal
        // ones are defined at runtime automatically and belong only to each own recipe
        recipeSources: this.#recipeSourcesCombinedWithMinimal,
      })
      .withLoggerFields({
        statistics: context.statistics,
      })
      .prependTestMocks(this.#testMocks);

    // Store the original vars
    const oldVars = context.vars;

    // Process variables from recipe
    aggregatedVars ??= await this.aggregateHostVars(context, context.host, context.vars);

    // Swap vars with local ones
    context.vars = aggregatedVars;
    this.#validateInputsOrThrow(context.vars);

    context.logger.info('Running recipe');

    const { changed, accumulatedVars, exit } = await Task.runTasksInContext(context, this.#tasks);

    // Restore the original vars
    context.vars = oldVars;

    context.logger.info(exit ? 'Recipe executed (exited on demand)' : 'Recipe executed');

    return {
      changed,
      vars: accumulatedVars,
    };
  }

  _aggregateGroupVarsForHost(host: InventoryHost): VarsInterface {
    const vars: VarsInterface = {};
    for (const groupName of host.groupNames) {
      const groupVars = this.config.groupVars?.[groupName] ?? {};
      Object.assign(vars, groupVars);
    }
    return vars;
  }

  /*
  I MEAN

  command line values (for example, -u my_user, these are not variables)
  role defaults (defined in role/defaults/main.yml)
  [XXX] inventory file vars
  [XXX] inventory group_vars/all
  [XXX] playbook group_vars/all
  [XXX] inventory group_vars/*
  [XXX] playbook group_vars/*
  [XXX] inventory host_vars/*
  [XXX] playbook host_vars/*
  [TODO] host facts / cached set_facts
  [TODO] play vars
  [TODO] play vars_prompt
  [TODO] play vars_files
  [TODO] role vars (defined in role/vars/main.yml)
  [TODO] block vars (only for tasks in block)
  [TODO] task vars (only for the task)
  [TODO] include_vars
  [TODO] set_facts / registered vars
  [TODO] role (and include_role) params
  [TODO] include params
  [TODO] extra vars (for example, -e "user=my_user")(always win precedence)
   */

  async aggregateHostVars(
    context: DataSourceContext,
    host: InventoryHost,
    contextVars?: VarsInterface,
  ): Promise<VarsInterface> {
    const vars: VarsInterface = {
      ...contextVars,
      __assetsDir: await this.getAssetsDir(),
    };

    // playbook group_vars/*
    Object.assign(vars, this._aggregateGroupVarsForHost(host));

    // inventory host_vars/*
    Object.assign(vars, await host.loadVars(context));

    // playbook host_vars/*
    Object.assign(vars, this.config.hostVars?.[host.id]);

    // [TODO] host facts / cached set_facts
    // play vars
    Object.assign(vars, this.config.vars);

    // [TODO] play vars_prompt
    // [TODO] play vars_files
    // [TODO] role vars (defined in role/vars/main.yml)
    // [TODO] block vars (only for tasks in block)
    // [TODO] task vars (only for the task)
    // [TODO] include_vars
    // [TODO] set_facts / registered vars
    // [TODO] role (and include_role) params
    // [TODO] include params
    // [TODO] extra vars (for example, -e "user=my_user")(always win precedence)

    return vars;
  }
}
