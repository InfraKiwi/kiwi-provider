/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunContext } from '../../util/runContext';
import { fileSerializersMap, ModuleWriteRawSchema, ModuleWriteSchema } from './schema';
import type { ModuleWriteInterface } from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import path from 'node:path';
import { getErrorPrintfClass } from '../../util/error';
import { fsPromiseExists, fsPromiseReadFile, fsPromiseWriteFile } from '../../util/fs';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';

export const ModuleWriteUnknownFileExtension = getErrorPrintfClass(
  'ModuleWriteUnknownFileExtension',
  'Unknown file extension: %s'
);

export interface ModuleWriteResult {
  path: string;
  content: string;
}

export class ModuleWrite extends AbstractModuleBase<ModuleWriteInterface, ModuleWriteResult> {
  readonly filePath = this.config.workDir ? path.resolve(this.config.workDir, this.config.path) : this.config.path;
  readonly extension = path.extname(this.filePath);

  async valid(): Promise<void> {
    if (!this.raw) {
      if (!(this.extension in fileSerializersMap)) {
        throw new ModuleWriteUnknownFileExtension(this.filePath);
      }
    }
  }

  get raw(): boolean {
    return this.config.raw ?? false;
  }

  async run(context: RunContext): Promise<ModuleRunResult<ModuleWriteResult>> {
    // const data: ModuleWriteResult = {};
    await this.valid();

    let toWrite: string;
    if (!this.raw) {
      const serializer = fileSerializersMap[this.extension];
      toWrite = await serializer(this.config.content);
    } else {
      toWrite = this.config.content;
    }

    // TODO mode/owner/etc

    if (await fsPromiseExists(this.filePath)) {
      const content = await fsPromiseReadFile(this.filePath, 'utf-8');
      if (content == toWrite) {
        context.logger.debug(`Destination file \`${this.filePath}\` already exists and has the same content, skipping`);
        return {
          vars: {
            path: this.filePath,
            content: toWrite,
          },
          changed: false,
        };
      }
      context.logger.debug(
        `Destination file \`${this.filePath}\` already exists and has different content, overwriting`
      );
    }

    await fsPromiseWriteFile(this.filePath, toWrite);

    return {
      vars: {
        path: this.filePath,
        content: toWrite,
      },
      changed: true,
    };
  }
}

export class ModuleWriteRaw extends ModuleWrite {
  get raw(): boolean {
    return true;
  }
}

moduleRegistryEntryFactory.register(ModuleWriteSchema, ModuleWrite);
moduleRegistryEntryFactory.register(ModuleWriteRawSchema, ModuleWriteRaw);
