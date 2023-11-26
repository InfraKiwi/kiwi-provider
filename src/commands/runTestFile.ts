import { tryOrThrowAsync } from '../util/try';
import { TestSchema } from '../components/testing.schema';
import type { TestInterface } from '../components/testing.schema.gen';
import { RecipeSchema } from '../components/recipe.schema';
import { localhost } from '../util/constants';
import { DataSourceFile } from '../dataSources/file';
import { RecipeTest } from '../components/recipeTest';
import type { RecipeCtorContext } from '../components/recipe';

export interface RunTestFileArgs {
  testPath: string;
  inventoryPath?: string;
}

export async function runTestFile(context: RecipeCtorContext, args: RunTestFileArgs) {
  // Load test
  const ds = new DataSourceFile({ path: args.testPath });
  const data = await tryOrThrowAsync(async () => ds.load(context), 'Failed to load test file');
  const realFileName = await ds.findValidFilePath(context);

  if (TestSchema.validate(data).error == null) {
    const test = new RecipeTest(data as TestInterface, { fileName: realFileName });
    await test.run(context, args.inventoryPath);
    return;
  }

  // Try to interpret the file as a recipe
  if (RecipeSchema.validate(data).error == null) {
    await RecipeTest.runRecipeForTesting(context, realFileName, undefined, localhost, []);
    return;
  }

  throw new Error(`Failed to validate test file ${args.testPath}`);
}
