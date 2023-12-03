import { AbstractRegistryEntry } from '../util/registry';
import type { RunContext } from '../util/runContext';
import type { ModuleRunResultInterface } from './abstractModuleBase.schema.gen';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModuleRunResultBaseType = Record<string, any>;

export interface ModuleRunResult<Type extends ModuleRunResultBaseType> extends Omit<ModuleRunResultInterface, 'vars'> {
  vars?: Type;
}

export abstract class AbstractModuleBase<
  ConfigType,
  ResultType extends ModuleRunResultBaseType,
> extends AbstractRegistryEntry<ConfigType> {
  get label(): string | undefined {
    return;
  }

  async run(context: RunContext): Promise<ModuleRunResult<ResultType>> {
    throw new Error('Not implemented');
  }
}

export type AbstractModuleBaseInstance = InstanceType<typeof AbstractModuleBase>;
