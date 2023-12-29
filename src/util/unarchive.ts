/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import path from 'node:path';
import * as tar from 'tar';
import type { Entry } from 'yauzl-promise';
import * as yauzl from 'yauzl-promise';
import fs from 'node:fs';
import { fsPromiseMkdir } from './fs';
import { finished } from 'node:stream/promises';

export enum UnarchiveArchiveType {
  'tar.gz' = 'tar.gz',
  zip = 'zip',
}

type FixedEntry = Omit<Entry, 'fileName'> & { filename: string };

export async function unarchiveFile(archiveFile: string, dest: string, archiveType?: UnarchiveArchiveType) {
  if (archiveType == null) {
    const extFromFile = path.extname(archiveFile);
    if (extFromFile.length == 0) {
      throw new Error(`The archive extension could not be deduced from the file name: ${archiveFile}`);
    }
    switch (extFromFile) {
      case '.tar.gz':
        archiveType = UnarchiveArchiveType['tar.gz'];
        break;
      case '.zip':
        archiveType = UnarchiveArchiveType.zip;
        break;
      default:
        throw new Error(`Unsupported archive extension: ${extFromFile}`);
    }
  }

  switch (archiveType) {
    case UnarchiveArchiveType['tar.gz']:
      await tar.x({
        cwd: dest,
        file: archiveFile,
      });
      break;
    case UnarchiveArchiveType.zip:
      {
        const zip = await yauzl.open(archiveFile);
        try {
          let entry: FixedEntry;
          while ((entry = (await zip.readEntry()) as unknown as FixedEntry) != null) {
            const p = path.join(dest, entry.filename);
            if (entry.filename.endsWith('/')) {
              await fsPromiseMkdir(p);
            } else {
              const readStream = await entry.openReadStream();
              const writeStream = fs.createWriteStream(p);
              await finished(readStream.pipe(writeStream));
            }
          }
        } finally {
          await zip.close();
        }
      }
      break;
    default:
      throw new Error(`Invalid archive type specified: ${archiveType}`);
  }
}
