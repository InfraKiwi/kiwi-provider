/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { Writable } from 'node:stream';
import * as stream from 'node:stream';
import { promisify } from 'node:util';
import { createWriteStream } from 'node:fs';
import type { Axios } from 'axios';
import { fsPromiseCopyFile, fsPromiseExists } from './fs';

const finished = promisify(stream.finished);

export async function downloadFile(fileUrl: string, outputLocationPath: string, axiosClient: Axios): Promise<void> {
  const parsedUrl = new URL(fileUrl);
  if (parsedUrl.protocol == 'file:') {
    // Slice removes the initial /
    const p = parsedUrl.pathname.slice(1);
    if (!(await fsPromiseExists(p))) {
      throw new Error(`File to download does not exist: ${fileUrl}`);
    }
    await fsPromiseCopyFile(p, outputLocationPath);
    return;
  }

  const writer = createWriteStream(outputLocationPath);
  const resp = await axiosClient.get(fileUrl, { responseType: 'stream' });
  (resp.data as Writable).pipe(writer);
  await finished(writer);
}
