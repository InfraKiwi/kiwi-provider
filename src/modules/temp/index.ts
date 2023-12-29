/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunContext } from '../../util/runContext';
import { ModuleTempDirSchema, ModuleTempSchema } from './schema';
import type { ModuleTempInterface } from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import * as tmp from 'tmp';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import { fsPromiseTmpDir, fsPromiseTmpFile } from '../../util/fs';

tmp.setGracefulCleanup();

export interface ModuleTempResult {
  path: string;
}

export class ModuleTemp extends AbstractModuleBase<ModuleTempInterface, ModuleTempResult> {
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

export class ModuleTempDir extends AbstractModuleBase<ModuleTempInterface, ModuleTempResult> {
  async run(context: RunContext): Promise<ModuleRunResult<ModuleTempResult>> {
    const { prefix, keep } = this.config;

    const filePath = await fsPromiseTmpDir({
      prefix,
      keep,
    });
    context.logger.debug(`Created temporary directory: ${filePath}`);

    return {
      vars: { path: filePath },
      changed: true,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleTempSchema, ModuleTemp);
moduleRegistryEntryFactory.register(ModuleTempDirSchema, ModuleTempDir);
