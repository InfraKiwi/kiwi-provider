import { describe, expect, test } from '@jest/globals';
import { newDebug } from '../util/debug';
import { fsPromiseStat } from '../util/fs';

const debug = newDebug(__filename);

describe.skip('stat', () => {
  test('returns stat', async () => {
    const stat = await fsPromiseStat('nonexistentrandom.file');
    expect(stat).not.toBeNull();
  });
});
