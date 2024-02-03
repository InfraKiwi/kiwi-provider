/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { promisify } from 'node:util';
import type { CopyOptions } from 'node:fs';
import fs from 'node:fs';
import path from 'node:path';
import type { DirOptions, FileOptionsDiscardFd } from 'tmp';
import * as tmp from 'tmp';
import type { URL } from 'node:url';
import { instanceOfNodeError } from './error';
import { promiseOrThrowOnTimeout, promiseWait } from './timeout';

export const fsPromiseOpen = promisify(fs.open);
export const fsPromiseClose = promisify(fs.close);
export const fsPromiseRm = promisify(fs.rm);
export const fsPromiseMkdir = promisify(fs.mkdir);
export const fsPromiseStat = promisify(fs.stat);
export const fsPromiseReadDir = promisify(fs.readdir);
export const fsPromiseLStat = promisify(fs.lstat);
export const fsPromiseExists = promisify(fs.exists);
export const fsPromiseCp = promisify(fs.cp) as (
  source: string | URL,
  destination: string | URL,
  opts?: CopyOptions
) => Promise<void>;
export const fsPromiseCopyFile = promisify(fs.copyFile);
export const fsPromiseReadFile = promisify(fs.readFile);
export const fsPromiseWriteFile = promisify(fs.writeFile);

export const fsPromiseTmpFile = promisify<FileOptionsDiscardFd, string>(tmp.file);
export const fsPromiseTmpDir = promisify<DirOptions, string>(tmp.dir);

export const fsPromiseIsDir = async (dirPath: string) =>
  (await fsPromiseExists(dirPath)) && (await fsPromiseStat(dirPath)).isDirectory();

/**
 * Returns the list of all files contained in the directory, with their path starting
 * from the directory itself.
 *
 * @param dirPath
 * @param maxDepth
 * @param prefix If defined, prepend this to every path.
 * Define prefix = dirPath to have the full path for every file.
 */
export async function getAllFiles(dirPath: string, maxDepth?: number, prefix?: string): Promise<string[]> {
  const files = await fsPromiseReadDir(dirPath);

  const arrayOfFiles: string[] = [];

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const pathWithPrefix = prefix ? path.join(prefix, file) : file;

    if ((await fsPromiseStat(fullPath)).isDirectory()) {
      if (maxDepth === 0) {
        continue;
      }
      arrayOfFiles.push(
        ...(await getAllFiles(fullPath, maxDepth != undefined ? maxDepth - 1 : undefined, pathWithPrefix))
      );
    } else {
      arrayOfFiles.push(pathWithPrefix);
    }
  }

  return arrayOfFiles;
}

export function getAllFilesSync(dirPath: string, maxDepth?: number, prefix?: string): string[] {
  const files = fs.readdirSync(dirPath);

  const arrayOfFiles: string[] = [];

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const pathWithPrefix = prefix ? path.join(prefix, file) : file;

    if (fs.statSync(fullPath).isDirectory()) {
      if (maxDepth === 0) {
        continue;
      }
      arrayOfFiles.push(...getAllFilesSync(fullPath, maxDepth != undefined ? maxDepth - 1 : undefined, pathWithPrefix));
    } else {
      arrayOfFiles.push(pathWithPrefix);
    }
  }

  return arrayOfFiles;
}

export async function waitForWritable(filePath: string, timeoutMs = 5000, checkIntervalMs = 500) {
  await promiseOrThrowOnTimeout<void>(
    (async () => {
      while (!(await isWritable(filePath))) {
        await promiseWait(checkIntervalMs);
      }
    })(),
    timeoutMs
  );
}

export async function isWritable(filePath: string): Promise<boolean> {
  try {
    await fsPromiseClose(await fsPromiseOpen(filePath, 'r+'));
    return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (instanceOfNodeError(err, Error) && err.code == 'EBUSY') {
      return false;
    }
    throw err;
  }
}
