import { AbstractRegistryEntry } from '../util/registry';
import type { RunContext } from '../util/runContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModuleRunResultBaseType = Record<string, any>;

export interface ModuleRunResult<Type extends ModuleRunResultBaseType> {
  failed?: string;
  exit?: boolean;
  vars?: Type;
  changed: boolean;
}

export abstract class AbstractModuleBase<
  ConfigType,
  ResultType extends ModuleRunResultBaseType,
> extends AbstractRegistryEntry<ConfigType> {
  get label(): string | undefined {
    return;
  }

  // If by default a module performs changes to the system, it must require a mock
  get requiresMock(): boolean {
    return true;
  }

  async run(context: RunContext): Promise<ModuleRunResult<ResultType>> {
    throw new Error('Not implemented');
  }
}

export type AbstractModuleBaseInstance = InstanceType<typeof AbstractModuleBase>;
