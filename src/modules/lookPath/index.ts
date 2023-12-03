import type { RunContext } from '../../util/runContext';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import type { ModuleLookPathInterface } from './schema.gen';
import { ModuleLookPathSchema } from './schema';
import { lookpath } from 'lookpath';
import { getErrorPrintfClass } from '../../util/error';

export interface ModuleLookPathResult {
  path?: string;
}

const ModuleLookPathErrorCmdNotFoundInPath = getErrorPrintfClass(
  'ModuleLookPathErrorCmdNotFoundInPath',
  `Command not found in path: %s`,
);

export class ModuleLookPath extends AbstractModuleBase<ModuleLookPathInterface, ModuleLookPathResult> {
  async run(context: RunContext): Promise<ModuleRunResult<ModuleLookPathResult>> {
    const config: ModuleLookPathInterface = typeof this.config == 'string' ? { cmd: this.config } : this.config;

    const result = await lookpath(config.cmd, {
      include: config.include,
      exclude: config.exclude,
    });

    return {
      failed: result == undefined ? new ModuleLookPathErrorCmdNotFoundInPath(config.cmd).toString() : undefined,
      vars: { path: result },
      changed: false,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleLookPathSchema, ModuleLookPath);
