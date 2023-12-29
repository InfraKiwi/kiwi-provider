/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, test } from '@jest/globals';
import { getAllFiles } from './fs';
import path from 'node:path';

describe('fs', () => {
  test('getAllFiles', async () => {
    const files = await getAllFiles(path.join(__dirname, 'test', 'fs'));
    expect(files).toEqual(['dir1/dir2/lol', 'dir1/hello', 'dir1/world', 'hello'].map((p) => path.normalize(p)));
  });

  test('getAllFiles max depth', async () => {
    const files = await getAllFiles(path.join(__dirname, 'test', 'fs'), 1);
    expect(files).toEqual(['dir1/hello', 'dir1/world', 'hello'].map((p) => path.normalize(p)));
  });
});
