import type { WrapperInterfaceWithConfigKey } from '../util/registry';
import { AbstractRegistryEntryWrappedConfig } from '../util/registry';
import type { Recipe } from '../components/recipe';
import type { RecipeSourceWrapperInterface } from './recipeSourceWrapper.schema.gen';
import { recipeSourceRegistry } from './registry';
import { RecipeSourceWrapperSchema } from './recipeSourceWrapper.schema';
import { sha1Hex } from '../util/crypto';
import type { RecipeCtorContext } from '../components/recipe';
import type { DataSourceContext } from '../dataSources/abstractDataSource';

export abstract class AbstractRecipeSource<
  ConfigType,
  ConfigKey extends string,
> extends AbstractRegistryEntryWrappedConfig<RecipeSourceWrapperInterface, ConfigType, ConfigKey> {
  static recipeSourceIdCounter = 0;
  readonly id: string;

  constructor(config: WrapperInterfaceWithConfigKey<RecipeSourceWrapperInterface, ConfigType, ConfigKey> | string) {
    super(recipeSourceRegistry, RecipeSourceWrapperSchema, config);
    this.id =
      this.wrapperConfig.id ?? `${this.registryEntry.entryName}_${AbstractRecipeSource.recipeSourceIdCounter++}`;
  }

  /*
   *Returns and id that depends on the config of the source and can be safely
   *used to identify the same source, even if defined independently in multiple places.
   */

  get uniqueId(): string {
    const configId = this.configId.replace(/\W/g, '_');
    const hash = sha1Hex(configId);
    return `${this.registryEntry.entryName}-${hash}`;
  }

  get canPropagate(): boolean {
    return this.wrapperConfig.skipPropagate != true;
  }

  protected abstract get configId(): string;

  abstract has(context: DataSourceContext, id: string): Promise<boolean>;

  abstract load(context: RecipeCtorContext, id: string): Promise<Recipe>;
}

export type AbstractRecipeSourceInstance = InstanceType<typeof AbstractRecipeSource>;
