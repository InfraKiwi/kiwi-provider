import { newDebug } from '../../util/debug';
import { describe, test } from '@jest/globals';
import { ModuleLookPath } from './index';
import { fsPromiseTmpFile } from '../../util/fs';
import { platformIsWin } from '../../util/os';
import path from 'node:path';
import { getTestRunContext } from '../../components/inventory.testutils';

const debug = newDebug(__filename);

describe('lookPath module', () => {
  test('finds a binary', async () => {
    const tmpBin = await fsPromiseTmpFile({
      discardDescriptor: true,
      mode: 0o777,
      postfix: platformIsWin ? '.exe' : '',
    });
    const ext = path.extname(tmpBin);
    const filename = path.basename(tmpBin, ext);
    const dir = path.dirname(tmpBin);
    const module = new ModuleLookPath({
      cmd: filename,
      include: [dir],
    });

    const result = await module.run(getTestRunContext());
    expect(result.vars?.path?.toLowerCase()).toEqual(tmpBin.toLowerCase());
  });
});
