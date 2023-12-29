/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

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
