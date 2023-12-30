/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { dataSourceRegistryEntryFactory } from '../registry';
import path from 'node:path';
import pLimit from 'p-limit';
import type { DataSourceFileInterface } from './schema.gen';
import { DataSourceFileRawSchema, DataSourceFileSchema, fileLoadersMap } from './schema';
import { getErrorPrintfClass } from '../../util/error';
import { fsPromiseExists, fsPromiseReadFile } from '../../util/fs';
import type { DataSourceContext } from '../abstractDataSource';
import { AbstractDataSource } from '../abstractDataSource';
import type { ContextWorkDir } from '../../util/context';

export const DataSourceFileErrorFileNotFound = getErrorPrintfClass(
  'DataSourceFileErrorFileNotFound',
  'Requested file does not exist: %s'
);
export const DataSourceFileUnknownFileExtension = getErrorPrintfClass(
  'DataSourceFileUnknownFileExtension',
  'Unknown file extension: %s'
);

export class DataSourceFile<DataType> extends AbstractDataSource<DataSourceFileInterface, DataType> {
  // Useful to limit max fs parallel requests
  static pLimit: pLimit.Limit = pLimit(100);

  static async readFile(filePath: string): Promise<string> {
    return await DataSourceFile.pLimit(() => fsPromiseReadFile(filePath, 'utf8'));
  }

  get raw(): boolean {
    return this.config.raw ?? false;
  }

  #validFilePathCache?: string;

  #getFilePath(context: ContextWorkDir): string {
    const workDir = this.config.workDir ?? context.workDir;
    return workDir ? path.resolve(workDir, this.config.path) : this.config.path;
  }

  async findValidFilePath(context: ContextWorkDir): Promise<string> {
    if (this.#validFilePathCache != null) {
      return this.#validFilePathCache;
    }

    const filePath = this.#getFilePath(context);

    if (await DataSourceFile.pLimit(() => fsPromiseExists(filePath))) {
      this.#validFilePathCache = filePath;
      return filePath;
    }

    if (this.raw) {
      throw new DataSourceFileErrorFileNotFound(filePath);
    }

    const availableExtensions = Object.keys(fileLoadersMap);
    for (const extension of availableExtensions) {
      const p = `${filePath}${extension}`;
      if (await DataSourceFile.pLimit(() => fsPromiseExists(p))) {
        this.#validFilePathCache = p;
        return p;
      }
    }

    throw new DataSourceFileErrorFileNotFound(filePath);
  }

  async valid(context: ContextWorkDir): Promise<void> {
    const filePath = await this.findValidFilePath(context);
    const extension = path.extname(filePath);

    if (!this.raw) {
      if (!(extension in fileLoadersMap)) {
        throw new DataSourceFileUnknownFileExtension(filePath);
      }
    }
  }

  async load(context: DataSourceContext): Promise<DataType> {
    await this.valid(context);

    if (this.raw) {
      const data = await DataSourceFile.readFile(this.#validFilePathCache!);
      return data as DataType;
    }

    const extension = path.extname(this.#validFilePathCache!);
    const loader = fileLoadersMap[extension];
    return (await loader(context, this.#validFilePathCache!)) as DataType;
  }
}

export class DataSourceFileRaw<DataType> extends DataSourceFile<DataType> {
  get raw(): boolean {
    return true;
  }
}

dataSourceRegistryEntryFactory.register(DataSourceFileSchema, DataSourceFile);
dataSourceRegistryEntryFactory.register(DataSourceFileRawSchema, DataSourceFileRaw);
