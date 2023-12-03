import { newDebug } from '../../util/debug';
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

const debug = newDebug(__dirname);

export class MultiDataSourceGlob<DataType> extends AbstractMultiDataSource<MultiDataSourceGlobInterface, DataType> {
  readonly globPath: string | string[];
  readonly options: GlobOptions | undefined = undefined;

  constructor(config: MultiDataSourceGlobInterface) {
    super(config);

    this.globPath = this.config.pattern;
    this.options = this.config.options;
  }

  #getWorkDir(context: ContextWorkDir): string | undefined {
    return this.config.workDir ? path.normalize(this.config.workDir) : context.workDir;
  }

  async #listEntriesRaw(context: DataSourceContext): Promise<string[]> {
    const options = this.options ?? {};

    options.withFileTypes = true;
    options.nodir = true;
    options.cwd = this.#getWorkDir(context);

    const globPaths = Array.isArray(this.globPath) ? this.globPath : [this.globPath];
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
