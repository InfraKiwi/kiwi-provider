/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

/*
 * Very inspired by ansible here
 * https://github.com/ansible/ansible/blob/devel/lib/ansible/inventory/manager.py#L429
 * I mean, they did it well
 */

import globrex from 'globrex';
import { escapeRegex } from './regex';
import path from 'node:path';
import { normalizePathToUnix } from './path';

interface HostPatternSubscript {
  start: number;
  end?: number;
  zeroPadding: number;

  patternBefore: string;
  patternAfter: string;
}

interface HostPatternSubscriptResult {
  subPattern: RegExp;
  subscript?: HostPatternSubscript;
}

/*
 * Gosh I wish we had proper multiline regexes here
 * https://github.com/ansible/ansible/blob/devel/lib/ansible/inventory/manager.py#L53C6-L53C6
 */
const patternWithSubscriptRegex = /^(.+)\[(?:([0-9]+)|([0-9]+):([0-9]*))](.*)$/;

const normalizeSeparatorCheck = path.normalize('\\') == path.normalize('/');

// This is really just a replica of Ansible's host pattern
export class HostPattern {
  readonly raw: string;
  readonly rawWithoutModifiers: string;
  readonly regex: RegExp;
  readonly subscript?: HostPatternSubscript;
  readonly containsSpecialChars: boolean;

  // If false, force exclusion
  readonly forceInclusion: boolean | undefined;

  constructor(pattern: string) {
    if (pattern.length == 0) {
      throw new Error('A host pattern needs to contain at least 1 character');
    }
    if (normalizeSeparatorCheck) {
      pattern = normalizePathToUnix(pattern);
    }
    this.raw = pattern;

    if (pattern.startsWith('&')) {
      this.forceInclusion = true;
      this.rawWithoutModifiers = pattern.substring(1);
    } else if (pattern.startsWith('!')) {
      this.forceInclusion = false;
      this.rawWithoutModifiers = pattern.substring(1);
    } else if (pattern.startsWith('~')) {
      this.rawWithoutModifiers = pattern.substring(1);
    } else {
      this.rawWithoutModifiers = this.raw;
    }

    // Process subscript
    let valueForSubscriptEvaluation = pattern;
    if (valueForSubscriptEvaluation.startsWith('&') || valueForSubscriptEvaluation.startsWith('!')) {
      valueForSubscriptEvaluation = valueForSubscriptEvaluation.substring(1);
    }
    const subscriptResult = HostPattern.splitSubscript(valueForSubscriptEvaluation);
    this.regex = subscriptResult.subPattern;
    this.subscript = subscriptResult.subscript;
    this.containsSpecialChars = ['.', '?', '*', '['].map((c) => this.raw.includes(c)).find((b) => b) != undefined;
  }

  static splitSubscript(pattern: string): HostPatternSubscriptResult {
    // Do not parse regexes for enumeration info
    if (pattern.startsWith('~')) {
      return { subPattern: HostPattern.compilePattern(pattern) };
    }

    const match = patternWithSubscriptRegex.exec(pattern);
    if (match == null) {
      return { subPattern: HostPattern.compilePattern(pattern) };
    }

    let subscript: HostPatternSubscript;
    const [
, patternBefore,
idxStr,
startStr,
endStr,
patternAfter,
] = match;
    if (idxStr) {
      const idx = parseInt(idxStr, 10);
      subscript = {
        start: idx,
        patternBefore,
        patternAfter,
        zeroPadding: getNumberPaddingZeroes(idxStr),
      };
    } else {
      let end = -1;
      if (endStr != '') {
        end = parseInt(endStr, 10);
      }
      const start = parseInt(startStr, 10);
      subscript = {
        start,
        end: end >= 0 ? end : undefined,
        patternBefore,
        patternAfter,
        zeroPadding: getNumberPaddingZeroes(startStr),
      };
    }

    const minChars = subscript.start.toString(10).length + subscript.zeroPadding;
    const maxChars = subscript.end ? subscript.end.toString(10).length : minChars;

    const newPattern =
      '~' +
      escapeRegex(patternBefore) +
      '(' +
      (subscript.end ? `\\d{${minChars},${maxChars}}` : `\\d{${minChars},}`) +
      ')' +
      escapeRegex(patternAfter);
    return {
      subPattern: HostPattern.compilePattern(newPattern),
      subscript,
    };
  }

  static compilePattern(pattern: string): RegExp {
    if (pattern.startsWith('~')) {
      return new RegExp(pattern.substring(1));
    }

    return globrex(pattern, { extended: true }).regex;
  }

  matchString(el: string): boolean {
    if (normalizeSeparatorCheck) {
      el = normalizePathToUnix(el);
    }
    const match = this.regex.exec(el);
    if (match == null) {
      return false;
    }
    if (this.subscript) {
      const idx = parseInt(match[1], 10);
      if (idx >= this.subscript.start) {
        if (this.subscript.end) {
          if (idx <= this.subscript.end) {
            return true;
          }
        } else {
          return true;
        }
      }
      return false;
    }
    return true;
  }

  matchList(str: string[]): string[] {
    return str.filter((el) => this.matchString(el));
  }
}

function getNumberPaddingZeroes(str: string): number {
  /*
   * 1
   * 01
   * 001
   */
  let count = 0;
  for (const char of str) {
    if (char == '0') {
      count++;
      continue;
    }
    break;
  }
  return count;
}
