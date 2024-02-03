/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { multiDataSourceRegistryEntryFactory } from '../registry';
import type { MultiDataSourceGlobInterface } from './schema.gen';
import type { GlobOptions } from 'glob';
import { glob } from 'glob';
import type { Path } from 'path-scurry';
import { naturalSortCompareFn } from '../../util/sort';
import { MultiDataSourceGlobSchema } from './schema';
import path from 'node:path';
import { DataSourceFile } from '../file';
import type { DataSourceContext } from '../abstractDataSource';
import { AbstractMultiDataSource } from '../abstractDataSource';
import type { ContextWorkDir } from '../../util/context';
import { omit } from '../../util/object';
import { getArrayFromSingleOrArray } from '../../util/array';

export class MultiDataSourceGlob<DataType> extends AbstractMultiDataSource<MultiDataSourceGlobInterface, DataType> {
  readonly globPath: string | string[];
  readonly options: GlobOptions;

  constructor(config: MultiDataSourceGlobInterface) {
    super(config);

    this.globPath = this.config.pattern;
    this.options = omit(this.config, ['pattern', 'workDir']);
  }

  #getWorkDir(context: ContextWorkDir): string | undefined {
    return this.config.workDir ? path.normalize(this.config.workDir) : context.workDir;
  }

  async #listEntriesRaw(context: DataSourceContext): Promise<string[]> {
    const options = { ...this.options };

    options.withFileTypes = true;
    options.nodir = true;
    options.cwd = this.#getWorkDir(context);

    const globPaths = getArrayFromSingleOrArray(this.globPath);
    const files = ((await glob.glob(globPaths, options)) as Path[])
      .sort((a, b) => naturalSortCompareFn(a.name, b.name))
      .map((f) => f.fullpath());

    return files;
  }

  async listEntries(context: DataSourceContext): Promise<string[]> {
    const workDir = this.#getWorkDir(context);
    return (await this.#listEntriesRaw(context)).map((fullPath) => {
      if (workDir) {
        return fullPath.substring(workDir.length + 1);
      }
      return fullPath;
    });
  }

  async loadEntry(context: DataSourceContext, entry: string): Promise<DataType> {
    const workDir = this.#getWorkDir(context);
    const filePath = workDir ? path.resolve(workDir, entry) : entry;
    const data = await new DataSourceFile<DataType>({ path: filePath }).loadVars(context);
    return data;
  }
}

multiDataSourceRegistryEntryFactory.register(MultiDataSourceGlobSchema, MultiDataSourceGlob);
