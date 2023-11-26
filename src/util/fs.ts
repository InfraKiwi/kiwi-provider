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
  opts?: CopyOptions,
) => Promise<void>;
export const fsPromiseCopyFile = promisify(fs.copyFile);
export const fsPromiseReadFile = promisify(fs.readFile);
export const fsPromiseWriteFile = promisify(fs.writeFile);

export const fsPromiseTmpFile = promisify<FileOptionsDiscardFd, string>(tmp.file);
export const fsPromiseTmpDir = promisify<DirOptions, string>(tmp.dir);

export async function getAllFiles(dirPath: string, prefix?: string): Promise<string[]> {
  const files = await fsPromiseReadDir(dirPath);

  const arrayOfFiles: string[] = [];

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const pathWithPrefix = prefix ? path.join(prefix, file) : file;

    if ((await fsPromiseStat(fullPath)).isDirectory()) {
      arrayOfFiles.push(...(await getAllFiles(fullPath, pathWithPrefix)));
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
    timeoutMs,
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
