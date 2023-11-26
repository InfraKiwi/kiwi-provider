import { describe, test } from '@jest/globals';
import { getAllFiles } from './fs';
import path from 'node:path';

describe('fs', () => {
  test('getAllFiles', async () => {
    const files = await getAllFiles(path.join(__dirname, 'test', 'fs'));

    expect(files).toEqual(['dir1/dir2/lol', 'dir1/hello', 'dir1/world', 'hello'].map(path.normalize));
  });
});
