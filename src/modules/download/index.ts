/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunContext } from '../../util/runContext';
import { ModuleDownloadSchema } from './schema';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleDownloadInterface } from './schema.gen';

import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import { executeAxiosRequest } from '../../util/axios';
import { createWriteStream } from 'node:fs';
import type { Writable } from 'node:stream';
import {
  fsPromiseExists,
  fsPromiseIsDir,
  fsPromiseMkdir,
  fsPromiseRm,
  fsPromiseStat,
  fsPromiseTmpDir,
  fsPromiseTmpFile,
} from '../../util/fs';
import { finished } from 'node:stream/promises';
import { UnarchiveArchiveType, unarchiveFile } from '../../util/unarchive';

export interface ModuleDownloadResult {
  path: string;
  size: number;
}

export class ModuleDownload extends AbstractModuleBase<ModuleDownloadInterface, ModuleDownloadResult> {
  async run(context: RunContext): Promise<ModuleRunResult<ModuleDownloadResult>> {
    let downloadPath: string;

    const { extract, http } = this.config;
    let dest = this.config.dest;
    if (dest == null) {
      if (extract) {
        dest = await fsPromiseTmpDir({ keep: false });
      } else {
        dest = await fsPromiseTmpFile({
          keep: false,
          discardDescriptor: true,
        });
      }
    }

    if (extract) {
      // The dest must be a dir, or must not exist and we'll create it
      if (await fsPromiseExists(dest)) {
        if (!(await fsPromiseIsDir(dest))) {
          throw new Error(
            'Invalid download destination provided. When the `extract` options is enabled, the destination path must be a directory.'
          );
        }
      } else {
        await fsPromiseMkdir(dest, { recursive: true });
      }
      downloadPath = await fsPromiseTmpFile({
        keep: false,
        discardDescriptor: true,
      });
    } else if (await fsPromiseIsDir(dest)) {
      // If the destination exists, and it is a directory, bad, we need a filename
      throw new Error('Invalid download destination provided. The provided path is a directory.');
    } else {
      downloadPath = dest;
    }

    const response = await executeAxiosRequest(context, {
      ...http,
      responseType: 'stream',
    });

    const writer = createWriteStream(downloadPath);
    (response.data as Writable).pipe(writer);
    await finished(writer);

    const fileSize = (await fsPromiseStat(downloadPath)).size;

    if (extract) {
      try {
        await unarchiveFile(downloadPath, dest, UnarchiveArchiveType[extract]);
      } finally {
        await fsPromiseRm(downloadPath).catch((err) =>
          context.logger.error('Failed to delete temporary file', { err })
        );
      }
    }

    return {
      vars: {
        path: dest,
        size: fileSize,
      },
      changed: true,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleDownloadSchema, ModuleDownload);
