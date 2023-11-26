import type { RunContext } from '../../util/runContext';
import { ModuleTempSchema } from './schema';
import type { ModuleTempInterface } from './schema.gen';
import { newDebug } from '../../util/debug';
import { moduleRegistryEntryFactory } from '../registry';
import * as tmp from 'tmp';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import { fsPromiseTmpFile } from '../../util/fs';

const debug = newDebug(__filename);

tmp.setGracefulCleanup();

export interface ModuleTempResult {
  path: string;
}

export class ModuleTemp extends AbstractModuleBase<ModuleTempInterface, ModuleTempResult> {
  get requiresMock(): boolean {
    // A bit of a special case, this will make changes to the system but at the same time
    // it will only create temporary files
    return false;
  }

  async run(context: RunContext): Promise<ModuleRunResult<ModuleTempResult>> {
    const { prefix, extension, keep } = this.config;

    const filePath = await fsPromiseTmpFile({
      prefix,
      postfix: extension ? `.${extension}` : undefined,
      keep,
      discardDescriptor: true,
    });
    context.logger.debug(`Created temporary file: ${filePath}`);

    return {
      vars: { path: filePath },
      changed: true,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleTempSchema, ModuleTemp);
