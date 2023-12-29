/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, test } from '@jest/globals';
import { ModuleLookPath } from './index';
import { fsPromiseTmpFile } from '../../util/fs';
import path from 'node:path';
import { getTestRunContext } from '../../components/inventory.testutils';
import { testExamples } from '../../util/testUtils';
import { platformIsWin } from '../../util/constants';

describe('lookPath module', () => {
  testExamples(__dirname);

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
