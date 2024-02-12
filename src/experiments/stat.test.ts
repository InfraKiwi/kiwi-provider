/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, expect, test } from '@jest/globals';
import { fsPromiseStat } from '../util/fs';

describe.skip('stat', () => {
  test('returns stat', async () => {
    const stat = await fsPromiseStat('nonexistentrandom.file');
    expect(stat).not.toBeNull();
  });
});
