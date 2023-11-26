import { describe, expect, test } from '@jest/globals';

import { shortieToObject } from './shortie';
import { newDebug } from './debug';

const debug = newDebug(__filename);

interface ShortieTest {
  args: string;
  expect?: object | Array<unknown>;
}

describe('shortie', () => {
  const tests: ShortieTest[] = [
    {
      args: 'asd=lol',
      expect: { asd: 'lol' },
    },
    {
      args: 'asd=lol hey=hoo',
      expect: { asd: 'lol', hey: 'hoo' },
    },
    {
      args: 'asd={nested=mah hey=hoo} muh=moo',
      expect: { asd: { nested: 'mah', hey: 'hoo' }, muh: 'moo' },
    },
    {
      args: 'asd=[1 2 3]',
      expect: { asd: [1, 2, 3] },
    },
    // These would only work if we allowed : as an equality char
    // {
    //   args: 'asd:boo',
    //   expect: { asd: 'boo' },
    // },
    // {
    //   args: 'asd:"boo:123"',
    //   expect: { asd: 'boo:123' },
    // },
    // {
    //   args: 'asd:"boo=123"',
    //   expect: { asd: 'boo=123' },
    // },
    // {
    //   args: 'asd:boo,mow=moo',
    //   expect: { asd: 'boo', mow: 'moo' },
    // },
    {
      args: 'asd={nested=[hello world] hey}',
      expect: { asd: { nested: ['hello', 'world'], hey: undefined } },
    },
    {
      args: 'hello=true',
      expect: { hello: true },
    },
    {
      args: 'hello="true"',
      expect: { hello: 'true' },
    },
    {
      args: 'dir={path="examples"}',
      expect: { dir: { path: 'examples' } },
    },
    {
      args: "dir={path='examples'}",
      expect: { dir: { path: 'examples' } },
    },
  ];

  test.each(tests)('$#', async (t) => {
    const shortied = shortieToObject(t.args, true);
    expect(shortied).toStrictEqual(t.expect);
  });
});
