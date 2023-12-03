import Joi from 'joi';
import { joiMetaClassName, joiObjectFromInstanceOf, joiObjectWithPattern } from '../util/joi';
import { recipeSourceRegistryEntryFactory } from '../recipeSources/registry';
import { RecipeForArchiveSchema } from './recipe.schema';
import path from 'node:path';

export const ArchiveConfigFilename = 'config.yaml';

export const ArchiveAssetsCompressedFileName = 'archive.tar.gz';

export const ArchiveRecipeEntrySchema = RecipeForArchiveSchema.append({ assetsArchive: Joi.string() }).meta(
  joiMetaClassName('ArchiveRecipeEntryInterface'),
);

export const ArchiveRecipesMapSchema = joiObjectWithPattern(ArchiveRecipeEntrySchema).meta(
  joiMetaClassName('ArchiveRecipesMapInterface'),
);

export const ArchiveSchema = Joi.object({
  rootRecipes: ArchiveRecipesMapSchema.required(),
  recipeSources: joiObjectWithPattern(ArchiveRecipesMapSchema).required(),
  timestamp: Joi.number().required(),
}).meta({ className: 'ArchiveInterface' });

// --- RecipeSource

export const RecipeSourceArchiveEntryNameRaw = 'archive';

export const RecipeSourceArchiveSchema = recipeSourceRegistryEntryFactory
  .createJoiEntrySchema(
    RecipeSourceArchiveEntryNameRaw,
    Joi.object({
      // Missing validation here to not create some kind of import loop really
      archive: Joi.object().required(),
      uniqueId: Joi.string().required(),
      recipesMap: ArchiveRecipesMapSchema.required(),
      // If true, do not extract assets for instantiated recipes
      dryRun: Joi.boolean().required(),
    }),
  )
  .meta(joiMetaClassName('RecipeSourceArchiveInterface'));

export const CreateArchiveArgsSchema = Joi.object({
  archiveDir: Joi.string(),
  recipes: Joi.array()
    .items(joiObjectFromInstanceOf('Recipe', path.resolve(__dirname, 'recipe')))
    .min(1)
    .required(),
}).meta(joiMetaClassName('CreateArchiveArgsInterface'));
