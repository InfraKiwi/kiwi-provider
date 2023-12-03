import { it, describe, test, expect } from '@jest/globals';
import path from 'node:path';
import { HostPattern } from './hostPattern';

function check(name: string, pattern: string, shouldMatch = true) {
  const p = new HostPattern(pattern);
  expect(p.matchString(name)).toEqual(shouldMatch);
}

const ignorecase = path.normalize('ABC') == path.normalize('abc');
const normsep = path.normalize('\\') == path.normalize('/');
const asciiLowercase = 'abcdefghijklmnopqrstuvwxyz';
const asciiUppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const digits = '0123456789';
const punctuation = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

describe('hostPattern', () => {
  it('test_hostPattern', () => {
    check('abc', 'abc');
    check('abc', '?*?');
    check('abc', '???*');
    check('abc', '*???');
    check('abc', '???');
    check('abc', '*');
    check('abc', 'ab[cd]');
    check('abc', 'ab[!de]');
    check('abc', 'ab[de]', false);
    check('a', '??', false);
    check('a', 'b', false);
  });

  it('test case', () => {
    check('abc', 'abc');
    check('AbC', 'abc', ignorecase);
    check('abc', 'AbC', ignorecase);
    check('AbC', 'AbC');
  });

  it('test separator', () => {
    check('usr/bin', 'usr/bin');
    check('usr\\bin', 'usr/bin', normsep);
    check('usr/bin', 'usr\\bin', normsep);
    check('usr\\bin', 'usr\\bin');
  });

  it('test charset', () => {
    const tescases = asciiLowercase + digits + punctuation;
    for (const c of tescases) {
      check(c, '[az]', 'az'.indexOf(c) >= 0);
      check(c, '[!az]', 'az'.indexOf(c) < 0);
    }
    // Case insensitive.
    for (const c of tescases) {
      check(c, '[AZ]', 'az'.indexOf(c) >= 0 && ignorecase);
      check(c, '[!AZ]', 'az'.indexOf(c) < 0 || !ignorecase);
    }
    for (const c of asciiUppercase) {
      check(c, '[az]', 'AZ'.indexOf(c) >= 0 && ignorecase);
      check(c, '[!az]', 'AZ'.indexOf(c) < 0 || !ignorecase);
    }
    // Repeated same character.
    for (const c of tescases) {
      check(c, '[aa]', c == 'a');
    }
    // Special cases.
    for (const c of tescases) {
      check(c, '[^az]', '^az'.indexOf(c) >= 0);
      check(c, '[[az]', '[az'.indexOf(c) >= 0);
    }
  });

  it('test range', () => {
    const tescases = asciiLowercase + digits + punctuation;
    for (const c of tescases) {
      check(c, '[b-d]', 'bcd'.indexOf(c) >= 0);
      check(c, '[!b-d]', 'bcd'.indexOf(c) < 0);
      check(c, '[b-dx-z]', 'bcdxyz'.indexOf(c) >= 0);
      check(c, '[!b-dx-z]', 'bcdxyz'.indexOf(c) < 0);
    }
    // Case insensitive.
    for (const c of tescases) {
      check(c, '[B-D]', 'bcd'.indexOf(c) >= 0 && ignorecase);
      check(c, '[!B-D]', 'bcd'.indexOf(c) < 0 || !ignorecase);
    }
    for (const c of asciiUppercase) {
      check(c, '[b-d]', 'BCD'.indexOf(c) >= 0 && ignorecase);
      check(c, '[!b-d]', 'BCD'.indexOf(c) < 0 || !ignorecase);
    }
    // Upper bound == lower bound.
    for (const c of tescases) {
      check(c, '[b-b]', c == 'b');
    }
    // Special cases.
    for (const c of tescases) {
      check(c, '[!-#]', '-#'.indexOf(c) < 0);
      check(c, '[!--.]', '-.'.indexOf(c) < 0);
      check(c, '[^-`]', '^_`'.indexOf(c) >= 0);
      if (!(normsep && c == '/')) {
        check(c, '[b-]', '-b'.indexOf(c) >= 0);
        check(c, '[!b-]', '-b'.indexOf(c) < 0);
        check(c, '[-b]', '-b'.indexOf(c) >= 0);
        check(c, '[!-b]', '-b'.indexOf(c) < 0);
        check(c, '[-]', '-'.indexOf(c) >= 0);
        check(c, '[!-]', '-'.indexOf(c) < 0);
      }
    }
  });

  /*
   * NOTE: not supported
   * it('test separator in range', () => {
   *   check('a/b', 'a[.-0]b', !normsep);
   *   check('a\\b', 'a[.-0]b', false);
   *   check('a\\b', 'a[Z-^]b', !normsep);
   *   check('a/b', 'a[Z-^]b', false);
   *
   *   check('a/b', 'a[/-0]b', !normsep);
   *   check('a[/-0]b', 'a[/-0]b', false);
   *
   *   check('a/b', 'a[.-/]b');
   *   check('a[.-/]b', 'a[.-/]b', false);
   * });
   */

  describe('test subscript', () => {
    test('subscript simple', () => {
      const p = new HostPattern('hello-world[1:3].hello.io');
      expect(p.subscript).not.toBeUndefined();
      expect(p.subscript!.zeroPadding).toEqual(0);
      expect(p.subscript!.start).toEqual(1);
      expect(p.subscript!.end).toEqual(3);
      expect(p.matchString('hello-world1.hello.io')).toEqual(true);
      expect(p.matchString('hello-world2.hello.io')).toEqual(true);
      expect(p.matchString('hello-world4.hello.io')).toEqual(false);
    });

    test('subscript with initial index only', () => {
      const p = new HostPattern('hello-world[2].hello.io');
      expect(p.subscript).not.toBeUndefined();
      expect(p.subscript!.zeroPadding).toEqual(0);
      expect(p.subscript!.start).toEqual(2);
      expect(p.subscript!.end).toBeUndefined();
      expect(p.matchString('hello-world1.hello.io')).toEqual(false);
      expect(p.matchString('hello-world2.hello.io')).toEqual(true);
      expect(p.matchString('hello-world4.hello.io')).toEqual(true);
    });

    test('subscript with start only', () => {
      const p = new HostPattern('hello-world[2:].hello.io');
      expect(p.subscript).not.toBeUndefined();
      expect(p.subscript!.zeroPadding).toEqual(0);
      expect(p.subscript!.start).toEqual(2);
      expect(p.subscript!.end).toBeUndefined();
      expect(p.matchString('hello-world1.hello.io')).toEqual(false);
      expect(p.matchString('hello-world2.hello.io')).toEqual(true);
      expect(p.matchString('hello-world4.hello.io')).toEqual(true);
    });

    test('subscript with padding initial index only', () => {
      const p = new HostPattern('hello-world[02].hello.io');
      expect(p.subscript).not.toBeUndefined();
      expect(p.subscript!.zeroPadding).toEqual(1);
      expect(p.subscript!.start).toEqual(2);
      expect(p.subscript!.end).toBeUndefined();
      expect(p.matchString('hello-world01.hello.io')).toEqual(false);
      expect(p.matchString('hello-world1.hello.io')).toEqual(false);
      expect(p.matchString('hello-world2.hello.io')).toEqual(false);
      expect(p.matchString('hello-world02.hello.io')).toEqual(true);
      expect(p.matchString('hello-world04.hello.io')).toEqual(true);
    });

    test('subscript with padding start only', () => {
      const p = new HostPattern('hello-world[02:].hello.io');
      expect(p.subscript).not.toBeUndefined();
      expect(p.subscript!.zeroPadding).toEqual(1);
      expect(p.subscript!.start).toEqual(2);
      expect(p.subscript!.end).toBeUndefined();
      expect(p.matchString('hello-world01.hello.io')).toEqual(false);
      expect(p.matchString('hello-world1.hello.io')).toEqual(false);
      expect(p.matchString('hello-world2.hello.io')).toEqual(false);
      expect(p.matchString('hello-world02.hello.io')).toEqual(true);
      expect(p.matchString('hello-world04.hello.io')).toEqual(true);
    });

    test('subscript with padding', () => {
      const p = new HostPattern('hello-world[02:55].hello.io');
      expect(p.subscript).not.toBeUndefined();
      expect(p.subscript!.zeroPadding).toEqual(1);
      expect(p.subscript!.start).toEqual(2);
      expect(p.subscript!.end).toEqual(55);
      expect(p.matchString('hello-world01.hello.io')).toEqual(false);
      expect(p.matchString('hello-world1.hello.io')).toEqual(false);
      expect(p.matchString('hello-world2.hello.io')).toEqual(false);
      expect(p.matchString('hello-world02.hello.io')).toEqual(true);
      expect(p.matchString('hello-world04.hello.io')).toEqual(true);
      expect(p.matchString('hello-world55.hello.io')).toEqual(true);
      expect(p.matchString('hello-world56.hello.io')).toEqual(false);
    });

    test('subscript with padding excess', () => {
      const p = new HostPattern('hello-world[02:555].hello.io');
      expect(p.subscript).not.toBeUndefined();
      expect(p.subscript!.zeroPadding).toEqual(1);
      expect(p.subscript!.start).toEqual(2);
      expect(p.subscript!.end).toEqual(555);
      expect(p.matchString('hello-world01.hello.io')).toEqual(false);
      expect(p.matchString('hello-world1.hello.io')).toEqual(false);
      expect(p.matchString('hello-world2.hello.io')).toEqual(false);
      expect(p.matchString('hello-world02.hello.io')).toEqual(true);
      expect(p.matchString('hello-world04.hello.io')).toEqual(true);
      expect(p.matchString('hello-world555.hello.io')).toEqual(true);
    });
  });
});
