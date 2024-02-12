/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { createGunzip, createGzip } from 'node:zlib';
import { createReadStream, createWriteStream } from 'node:fs';
import { promisify } from 'node:util';
import { pipeline } from 'node:stream';

const pipe = promisify(pipeline);

export async function createGz(src: string, dest: string) {
  const gzip = createGzip();
  const source = createReadStream(src);
  const destination = createWriteStream(dest);
  await pipe(source, gzip, destination);
}

export async function extractGz(src: string, dest: string) {
  const gzip = createGunzip();
  const source = createReadStream(src);
  const destination = createWriteStream(dest);
  await pipe(source, gzip, destination);
}
