import { describe, expect, test } from '@jest/globals';
import { fsPromiseStat } from '../util/fs';

describe.skip('stat', () => {
  test('returns stat', async () => {
    const stat = await fsPromiseStat('nonexistentrandom.file');
    expect(stat).not.toBeNull();
  });
});
