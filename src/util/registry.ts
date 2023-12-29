/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { toPascalCase } from 'js-convert-case';
import { shortieToArray, shortieToObject } from './shortie';
import { joiSchemaAcceptsString } from './joi';

export const joiMetaDisableShortieKey = 'disableShortie';

export abstract class AbstractRegistryEntry<ConfigType> {
  readonly config: ConfigType;
  static registryEntry: RegistryEntry;

  constructor(config: ConfigType) {
    const disableShortie = joiSchemaAcceptsString(this.registryEntry.schema);
    if (!disableShortie && typeof config == 'string') {
      if (config.length && config.startsWith('[')) {
        config = shortieToArray(config) as ConfigType;
      } else {
        config = shortieToObject(config) as ConfigType;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.config = Joi.attempt(config, this.registryEntry.schema, `Error validating ${this.registryEntry.entryName}:`);
  }

  get registryEntry(): RegistryEntry {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.constructor as any).registryEntry as RegistryEntry;
  }
}

export type WrapperInterfaceWithConfigKey<
  WrapperConfigType extends RegistryEntryGenericConfig,
  ConfigType,
  ConfigKey extends string,
> = RemoveIndex<WrapperConfigType> & { [K in ConfigKey]: ConfigType };

/*
 *This class exists for the purpose of having registry entries that are configured with an outer wrapper config, like the recipeSources ones
 */
export abstract class AbstractRegistryEntryWrappedConfig<
  WrapperConfigType extends RegistryEntryGenericConfig,
  ConfigType,
  ConfigKey extends string,
> extends AbstractRegistryEntry<ConfigType> {
  readonly wrapperConfig: WrapperInterfaceWithConfigKey<WrapperConfigType, ConfigType, ConfigKey>;

  protected constructor(
    registry: Registry,
    wrapperSchema: Joi.ObjectSchema,
    config: WrapperInterfaceWithConfigKey<WrapperConfigType, ConfigType, ConfigKey> | string
  ) {
    if (typeof config == 'string') {
      if (config.length && config.startsWith('[')) {
        throw new Error('Invalid shortie config for RecipeSourceWrapperInterface');
      } else {
        config = shortieToObject(config) as WrapperInterfaceWithConfigKey<WrapperConfigType, ConfigType, ConfigKey>;
      }
    }

    config = Joi.attempt(config, wrapperSchema) as WrapperInterfaceWithConfigKey<
      WrapperConfigType,
      ConfigType,
      ConfigKey
    >;
    const registryEntry = registry.findRegistryEntryFromIndexedConfig(config, wrapperSchema);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moduleConfig = config[registryEntry.entryName as ConfigKey] as any;

    super(moduleConfig);
    this.wrapperConfig = config;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RegistryEntryClazz<ConfigType, T extends typeof AbstractRegistryEntry<ConfigType>> = new (
  config: ConfigType
) => InstanceType<T>;

export interface RegistryEntry {
  entryName: string;
  schema: Joi.Schema;
  // clazz: typeof AbstractRegistryEntry<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clazz: RegistryEntryClazz<any, any>;
}

export type RegistryEntryGenericConfig = Record<string, unknown>;

export class Registry {
  readonly #entryLabel: string;
  #entries: Record<string, RegistryEntry> = {};

  constructor(entryLabel: string) {
    this.#entryLabel = entryLabel;
  }

  register(entry: RegistryEntry) {
    const key = entry.entryName;
    if (key == null) {
      throw new Error(`Error while registering ${this.#entryLabel}`);
    }
    if (key in this.#entries) {
      throw new Error(`A ${this.#entryLabel} with key ${key} has already been registered`);
    }

    this.#entries[key] = entry;
  }

  keys(): string[] {
    return Object.keys(this.#entries);
  }

  mustGet(key: string): RegistryEntry {
    const entry = this.#entries[key];
    if (entry == null) {
      throw new Error(`A ${this.#entryLabel} with ${key} cannot be found`);
    }
    return entry;
  }

  getAggregatedObjectSchema(baseSchema?: Joi.ObjectSchema): Joi.Schema {
    if (baseSchema == null) {
      baseSchema = Joi.object();
    }
    const allEntryKeys = Object.keys(this.#entries);

    for (const entryKey in this.#entries) {
      baseSchema = baseSchema.keys({ [entryKey]: this.#entries[entryKey].schema });
    }
    // Allow only one entry at a time
    baseSchema = baseSchema.xor(...allEntryKeys);

    return baseSchema;
  }

  /*
   * This aggregated schema is used to purely validate that we're using the right keys,
   * but does not go deeper in the validation flow
   */
  getAggregatedObjectSchemaWeak(baseSchema?: Joi.ObjectSchema): Joi.Schema {
    if (baseSchema == null) {
      baseSchema = Joi.object();
    }
    const allEntryKeys = Object.keys(this.#entries);

    for (const entryKey in this.#entries) {
      baseSchema = baseSchema.keys({ [entryKey]: Joi.any() });
    }
    // Allow only one entry at a time
    baseSchema = baseSchema.xor(...allEntryKeys);

    return baseSchema;
  }

  findRegistryEntryFromIndexedConfig(
    config: RegistryEntryGenericConfig,
    baseSchema: Joi.ObjectSchema,
    label?: string
  ): RegistryEntry {
    label ??= this.#entryLabel;
    const describe = baseSchema.describe();
    const rawSchemaKeys = describe.keys ? new Set(Object.keys(describe.keys)) : [];
    const schema = this.getAggregatedObjectSchemaWeak(baseSchema);
    config = Joi.attempt(config, schema, `Error validating ${label}:`) as RegistryEntryGenericConfig;
    const remainingSchemaKeys = new Set(Object.keys(config));
    for (const rawSchemaKey of rawSchemaKeys) {
      remainingSchemaKeys.delete(rawSchemaKey);
    }
    const remainingSchemaKeysArray = Array.from(remainingSchemaKeys);
    if (remainingSchemaKeysArray.length == 0) {
      throw new Error(`Missing ${label} key`);
    }
    if (remainingSchemaKeysArray.length > 1) {
      throw new Error(
        `Only one ${label} key can be defined, found ${
          remainingSchemaKeysArray.length
        }: ${remainingSchemaKeysArray.join(', ')}`
      );
    }
    const moduleKey = remainingSchemaKeysArray[0];
    const registryEntry = this.mustGet(moduleKey);
    return registryEntry;
  }

  getRegistryEntryInstanceFromIndexedConfig<ReturnType extends InstanceType<typeof AbstractRegistryEntry>>(
    config: RegistryEntryGenericConfig,
    outerSchema: Joi.ObjectSchema,
    label?: string
  ): ReturnType {
    const registryEntry = this.findRegistryEntryFromIndexedConfig(config, outerSchema, label);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moduleConfig = config[registryEntry.entryName] as any;
    const instance = new registryEntry.clazz(moduleConfig);
    return instance;
  }

  getRegistryEntryInstanceFromWrappedIndexedConfig<ReturnType extends InstanceType<typeof AbstractRegistryEntry>>(
    config: RegistryEntryGenericConfig,
    baseSchema: Joi.ObjectSchema,
    label?: string
  ): ReturnType {
    const registryEntry = this.findRegistryEntryFromIndexedConfig(config, baseSchema, label);

    /*
     * We DO NOT unwrap the config here!
     * This means the source needs to unwrap it by itself!
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moduleConfig = config as any;
    const instance = new registryEntry.clazz(moduleConfig);
    return instance;
  }
}

export function registryGetClassNameFromJoiSchema(schema: Joi.Schema): string | null {
  const describe = schema.describe();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const metas: Record<string, any>[] = (describe.metas as Record<string, any>[]) ?? [];
  const className = metas.findLast((el) => typeof el == 'object' && 'className' in el)?.['className'] as string;
  return className;
}

export function registryGetEntryNamesFromJoiSchema(schema: Joi.Schema): string[] | null {
  const describe = schema.describe();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const metas: Record<string, any>[] = (describe.metas as Record<string, any>[]) ?? [];
  const entryNames = metas.findLast((el) => typeof el == 'object' && 'entryNames' in el)?.['entryNames'] as string[];
  return entryNames;
}

interface createJoiEntrySchemaOptions {
  label?: string;
  aliases?: string[];
}

export class RegistryEntryFactory {
  readonly typeName: string;
  readonly baseDir: string;
  readonly registry: Registry;

  constructor(options: { typeName: string; baseDir: string; registry: Registry }) {
    this.typeName = options.typeName;
    this.baseDir = options.baseDir;
    this.registry = options.registry;
  }

  createJoiEntrySchema(entryNameRaw: string, schema: Joi.Schema, options?: createJoiEntrySchemaOptions) {
    const entryNameWithoutPath = entryNameRaw.replace(this.baseDir, '');
    const entryNameBase = /^[/\\]/.test(entryNameWithoutPath)
      ? entryNameWithoutPath.substring(1)
      : entryNameWithoutPath;
    options ??= {};
    options.label ??= toPascalCase(this.typeName) + toPascalCase(entryNameBase) + 'Interface';
    schema = schema.meta({
      className: options.label,
      entryNames: [entryNameBase, ...(options.aliases ?? [])],
    });
    const disableShortie = joiSchemaAcceptsString(schema);
    if (disableShortie) {
      schema = schema.meta({ [joiMetaDisableShortieKey]: true });
    }
    return schema;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register<EntryClzType extends RegistryEntryClazz<any, typeof AbstractRegistryEntry<any>>>(
    schema: Joi.Schema,
    clazz: EntryClzType
  ) {
    const entryNames = registryGetEntryNamesFromJoiSchema(schema);
    if (entryNames == null) {
      throw new Error('Error registering entry, entryNames not found in Schema meta');
    }

    for (const entryName of entryNames) {
      const entry: RegistryEntry = {
        entryName,
        schema,
        clazz,
      };
      (clazz as unknown as typeof AbstractRegistryEntry<object>).registryEntry = entry;
      this.registry.register(entry);
    }
  }
}
