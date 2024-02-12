/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import path from 'node:path';
import * as tar from 'tar';
import type { Entry } from 'yauzl-promise';
import * as yauzl from 'yauzl-promise';
import fs from 'node:fs';
import { fsPromiseMkdir } from './fs';
import { finished } from 'node:stream/promises';
import { extractGz } from './gz';

export enum UnarchiveArchiveType {
  'tar.gz' = 'tar.gz',
  gz = 'gz',
  zip = 'zip',
}

type FixedEntry = Omit<Entry, 'fileName'> & { filename: string };

/**
 * Unarchives a file to `dest`.
 * Depending on the file format, the returned string will be either
 * a directory or a single file (e.g. in `gz` case)
 */
export async function unarchiveFile(
  archiveFile: string,
  dest: string,
  archiveType?: UnarchiveArchiveType
): Promise<string> {
  if (archiveType == null) {
    if (archiveFile.endsWith('.tar.gz')) {
      archiveType = UnarchiveArchiveType['tar.gz'];
    } else if (archiveFile.endsWith('.gz')) {
      archiveType = UnarchiveArchiveType.gz;
    } else if (archiveFile.endsWith('.zip')) {
      archiveType = UnarchiveArchiveType.zip;
    }

    if (archiveType == null) {
      throw new Error(`Unsupported archive extension: ${archiveFile}`);
    }
  }

  switch (archiveType) {
    case UnarchiveArchiveType['tar.gz']:
      await tar.x({
        cwd: dest,
        file: archiveFile,
      });
      return dest;

    case UnarchiveArchiveType.gz: {
      const destFileName = path.basename(archiveFile).replace(/\.gz$/, '');
      const destFile = path.join(dest, destFileName);
      await extractGz(archiveFile, destFile);
      return destFile;
    }

    case UnarchiveArchiveType.zip: {
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
      return dest;
    }

    default:
      throw new Error(`Invalid archive type specified: ${archiveType}`);
  }
}
