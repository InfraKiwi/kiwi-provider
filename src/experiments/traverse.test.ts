/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, test } from '@jest/globals';
import type { TraverseContext } from 'traverse';
import traverse from 'traverse';
import { JSONPath } from 'jsonpath-plus';
import { newLogger } from '../util/logger';

const logger = newLogger();

describe.skip('traverse', () => {
  const getPath = (p: string[]): string => {
    return JSONPath.toPathString(['$', ...p]);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getDebugObject(thisObj: TraverseContext, val: any): object {
    return {
      parent: thisObj.parent?.node,
      key: thisObj.key,
      path: thisObj.path,
      val,
      jsonPath: getPath(thisObj.path),
    };
  }

  test('iterates on stuff', () => {
    traverse('hello').forEach(function (val) {
      if (this.notLeaf) {
        return;
      }
      logger.info('string iteration', getDebugObject(this, val));
    });

    traverse(['hello', 'world']).forEach(function (val) {
      if (this.notLeaf) {
        return;
      }
      logger.info('array iteration', getDebugObject(this, val));
    });

    traverse({
      one: 'world',
      two: 'moons',
      three: { nested: 'monkeys' },
    }).forEach(function (val) {
      if (this.notLeaf) {
        return;
      }
      logger.info('object iteration', getDebugObject(this, val));
    });
  });
});
