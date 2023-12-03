import { fsPromiseExists, fsPromiseReadFile, fsPromiseWriteFile } from '../../util/fs';

export interface ReleaseDatabaseContents {
  release: string;
}

export class ReleaseDatabase {
  readonly #path: string;

  constructor(path: string) {
    this.#path = path;
  }

  async exists(): Promise<boolean> {
    return await fsPromiseExists(this.#path);
  }

  async get(): Promise<ReleaseDatabaseContents> {
    return JSON.parse(await fsPromiseReadFile(this.#path, 'utf-8'));
  }

  async getRelease(): Promise<string> {
    return (await this.get()).release;
  }

  async set(contents: ReleaseDatabaseContents): Promise<void> {
    return await fsPromiseWriteFile(this.#path, JSON.stringify(contents));
  }
}
