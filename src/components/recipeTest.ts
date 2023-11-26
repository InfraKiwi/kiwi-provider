import type { TestInterface } from './testing.schema.gen';
import { TestSchema } from './testing.schema';
import { DataSourceFile, getAvailableFileLoadersExtensions } from '../dataSources/file';
import { escapeRegex } from '../util/regex';
import path from 'node:path';
import { localhost } from '../util/constants';
import { runRecipe } from '../commands/runRecipe';
import { RecipeTestMock } from './recipeTestMock';
import type { DataSourceContext } from '../dataSources/abstractDataSource';
import Joi from 'joi';
import type { RecipeCtorContext } from './recipe';

interface TestMetadata {
  fileName?: string;
}

export class RecipeTest {
  testConfig: TestInterface;
  meta?: TestMetadata;
  mocks: RecipeTestMock[];

  constructor(testConfig: TestInterface, meta?: TestMetadata) {
    this.testConfig = Joi.attempt(testConfig, TestSchema);
    this.meta = meta;
    this.mocks = (this.testConfig.mocks ?? []).map((config) => new RecipeTestMock(config));
  }

  #recipeFilePath?: string;

  async findRecipeFile(context: DataSourceContext): Promise<string> {
    if (this.#recipeFilePath) {
      return this.#recipeFilePath;
    }

    const supportedLoaderExtensions = getAvailableFileLoadersExtensions().map(escapeRegex).join('|');
    const regex = new RegExp(`\\.test${supportedLoaderExtensions}$`);

    let recipeFile = this.testConfig.recipe ?? this.meta?.fileName?.replace(regex, '');
    if (recipeFile == null) {
      throw new Error(
        'A matching recipe name for the test could not be found, please provide one either as `recipe` field in the test file or make sure the test file name matches `recipe name + .test`',
      );
    }

    if (!path.isAbsolute(recipeFile)) {
      const testPaths = [];
      if (this.meta?.fileName) {
        testPaths.push(path.resolve(path.dirname(this.meta.fileName), recipeFile));
      }
      testPaths.push(path.resolve(process.cwd(), recipeFile));

      let foundPath: string | undefined;
      for (const testPath of testPaths) {
        try {
          const validPath = await new DataSourceFile({ path: testPath }).findValidFilePath(context);
          context.logger?.debug(`Found recipe in path ${validPath}`);
          foundPath = validPath;
          break;
        } catch (err) {
          context.logger?.debug(`Failed to find recipe in path ${testPath}`, { err });
        }
      }
      recipeFile = foundPath;
    }

    if (recipeFile == null) {
      throw new Error(
        'A matching recipe file for the test could not be found, please provide a valid path either as `recipe` field in the test file or make sure the test file name matches `recipe name + .test`',
      );
    }

    return recipeFile;
  }

  async run(context: RecipeCtorContext, inventoryPath?: string) {
    const recipeFile = await this.findRecipeFile(context);
    const targets = this.testConfig.targets ?? [localhost];

    for (const hostname of targets) {
      await RecipeTest.runRecipeForTesting(context, recipeFile, inventoryPath, hostname, this.mocks);
    }
  }

  static async runRecipeForTesting(
    context: RecipeCtorContext,
    recipeFile: string,
    inventoryPath: string | undefined,
    hostname: string,
    mocks?: RecipeTestMock[],
  ) {
    try {
      await runRecipe(context, {
        recipePath: recipeFile,
        hostname,
        inventoryPath,
        runContextPartial: {
          isTesting: true,
          testMocks: mocks,
        },
      });
    } catch (err) {
      context.logger?.error(`Failed to run recipe on target \`${hostname}\``, { err });
    }
  }
}
