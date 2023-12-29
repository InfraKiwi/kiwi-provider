/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunContext } from '../../util/runContext';
import { ModuleStoreSchema } from './schema';
import type { ModuleStoreInterface } from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import path from 'node:path';
import { DEFAULT_SCHEMA, dump } from 'js-yaml';
import { getErrorPrintfClass } from '../../util/error';
import { fsPromiseExists, fsPromiseReadFile, fsPromiseWriteFile } from '../../util/fs';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';

type ModuleStoreSerializerFunction = (data: unknown) => Promise<string>;

const serializerYAML: ModuleStoreSerializerFunction = async (data: unknown): Promise<string> => {
  return dump(data, { schema: DEFAULT_SCHEMA });
};
const serializerJSON: ModuleStoreSerializerFunction = async (data: unknown): Promise<string> => {
  return JSON.stringify(data);
};

const fileSerializersMap: Record<string, ModuleStoreSerializerFunction> = {
  '.yaml': serializerYAML,
  '.yml': serializerYAML,
  '.json': serializerJSON,
};

export const ModuleStoreUnknownFileExtension = getErrorPrintfClass(
  'ModuleStoreUnknownFileExtension',
  'Unknown file extension: %s'
);

export interface ModuleStoreResult {
  path: string;
  content: string;
}

export class ModuleStore extends AbstractModuleBase<ModuleStoreInterface, ModuleStoreResult> {
  readonly filePath = this.config.workDir ? path.resolve(this.config.workDir, this.config.path) : this.config.path;
  readonly extension = path.extname(this.filePath);

  async valid(): Promise<void> {
    if (!this.config.raw) {
      if (!(this.extension in fileSerializersMap)) {
        throw new ModuleStoreUnknownFileExtension(this.filePath);
      }
    }
  }

  async run(context: RunContext): Promise<ModuleRunResult<ModuleStoreResult>> {
    // const data: ModuleStoreResult = {};
    await this.valid();

    let toWrite: string;
    if (this.config.raw != true) {
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

moduleRegistryEntryFactory.register(ModuleStoreSchema, ModuleStore);
