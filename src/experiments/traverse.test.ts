import { describe, test } from '@jest/globals';
import type { TraverseContext } from 'traverse';
import traverse from 'traverse';
import { newDebug } from '../util/debug';
import { JSONPath } from 'jsonpath-plus';

const debug = newDebug(__filename);

describe.skip('traverse', () => {
  const getPath = (p: string[]): string => {
    return JSONPath.toPathString(['$', ...p]);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getDebugObject(thisObj: TraverseContext, val: any): object {
    return { parent: thisObj.parent?.node, key: thisObj.key, path: thisObj.path, val, jsonPath: getPath(thisObj.path) };
  }

  test('iterates on stuff', () => {
    traverse('hello').forEach(function (val) {
      if (this.notLeaf) {
        return;
      }
      debug('string iteration', getDebugObject(this, val));
    });

    traverse(['hello', 'world']).forEach(function (val) {
      if (this.notLeaf) {
        return;
      }
      debug('array iteration', getDebugObject(this, val));
    });

    traverse({ one: 'world', two: 'moons', three: { nested: 'monkeys' } }).forEach(function (val) {
      if (this.notLeaf) {
        return;
      }
      debug('object iteration', getDebugObject(this, val));
    });
  });
});
