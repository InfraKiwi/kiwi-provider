import { load } from 'js-yaml';
import { newDebug } from './debug';

const debug = newDebug(__filename);

// This is a rework of the wonderful https://github.com/rgov/node-shlex/ <3

export class Shortie {
  readonly string: string;
  readonly #debug: boolean;
  readonly #inArray: boolean;

  constructor(string: string, inArray: boolean, debug?: boolean) {
    this.string = string;
    this.#debug = debug ?? false;
    this.#inArray = inArray;
  }

  /**
   * Characters that will be considered whitespace and skipped. Whitespace
   * bounds tokens. By default, includes space, tab, comma
   */
  readonly charsWhitespaces = ' \t,';

  /**
   * Characters that will be considered string quotes. The token accumulates
   * until the same quote is encountered again (thus, different quote types
   * protect each other as in the shell.) By default, includes ASCII single
   * and double quotes.
   */
  readonly charsQuotes = `'"`;

  /**
   * Characters that will be considered as escape. Just `\` by default.
   */
  readonly charsEscapes = '\\';

  /**
   * The subset of quote types that allow escaped characters. Just `"` by default.
   */
  readonly charsEscapedQuotes = '"';

  /**
   * Characters triggering equality
   */
  readonly charsEquality = '=';

  /**
   * Characters triggering nested objects
   */
  readonly charsNestedObjectBegin = '{';
  readonly charsNestedObjectEnd = '}';

  /**
   * Characters triggering nested arrays
   */
  readonly charsNestedArrayBegin = '[';
  readonly charsNestedArrayEnd = ']';

  // The current char index
  #i = 0;

  nextChar(): string {
    return this.string.charAt(this.#i++);
  }

  /*
   * parse(): object {
   *   const obj: Record<string, unknown> = {};
   *
   *
   * }
   */

  processEscapes(string: string, quote: string) {
    if (!this.charsEscapedQuotes.includes(quote)) {
      // This quote type doesn't support escape sequences
      return string;
    }

    /*
     * We need to form a regex that matches any of the escape characters,
     * without interpreting any of the characters as a regex special character.
     */
    const anyEscape = '[' + this.charsEscapes.replace(/(.)/g, '\\$1') + ']';

    /*
     * In regular quoted strings, we can only escape an escape character, and
     * the quote character itself.
     */
    if (this.charsEscapedQuotes.includes(quote)) {
      const re = new RegExp(anyEscape + '(' + anyEscape + '|\\' + quote + ')', 'g');
      return string.replace(re, '$1');
    }

    // Should not get here
    return undefined;
  }

  *[Symbol.iterator](): Generator<[string | undefined, unknown]> {
    let currentObjectKey: string | undefined;

    let lastCharWasQuoted = false;
    let inQuote: string | false = false;
    // We always begin from an object key, and if false it means we're in its value
    let inObjectKey = !this.#inArray;
    let inNestedObject = false;
    let inNestedArray = false;
    let escaped: string | false = false;
    let token: string | undefined;
    let charIsEndOfNested = false;
    let prevCharWasEndOfNested = false;

    if (this.#debug) {
      debug('full input', '>' + this.string + '<');
    }

    const reset = () => {
      currentObjectKey = undefined;
      token = undefined;
      if (!this.#inArray) {
        inObjectKey = true;
      }
    };

    const getValue = (lastCharWasQuoted: boolean): unknown => {
      if (token == undefined) {
        return undefined;
      }
      if (lastCharWasQuoted) {
        return token;
      }
      return load(token);
    };

    while (true) {
      prevCharWasEndOfNested = charIsEndOfNested;
      charIsEndOfNested = false;

      const pos = this.#i;
      const char = this.nextChar();

      const lastCharWasQuotedCache = lastCharWasQuoted;
      lastCharWasQuoted = false;

      if (this.#debug) {
        debug('%o', {
          pos,
          char,
          token,
          inQuote,
          escaped,
          inObjKey: inObjectKey,
          inNObject: inNestedObject,
          inNArray: inNestedArray,
          curKey: currentObjectKey,
          lastQ: lastCharWasQuotedCache,
        });
      }

      if (char == '') {
        // End!
        if (inQuote) {
          throw new Error('Got EOF while in a quoted string');
        }
        if (escaped) {
          throw new Error('Got EOF while in an escape sequence');
        }
        if (!this.#inArray && inObjectKey) {
          // This is the closing case
          this.#debug && debug('Closing case for object', { token });
          if (token != undefined) {
            yield [token, undefined];
          }
          return;
        }
        if (inNestedObject) {
          throw new Error('Got EOF while in an unclosed nested object');
        }
        if (inNestedArray) {
          throw new Error('Got EOF while in an unclosed nested array');
        }
        const value = getValue(lastCharWasQuotedCache);
        this.#debug &&
          debug('Closing case', {
            currentObjectKey,
            value,
          });
        yield [currentObjectKey, value];
        return;
      }

      if (this.charsNestedObjectEnd.includes(char) && inNestedObject) {
        if (!inNestedObject) {
          throw new Error('Detected end of object while not in object mode');
        }
        inNestedObject = false;
        charIsEndOfNested = true;
        const objectValue = token == null ? {} : shortieToObject(token);
        this.#debug &&
          debug('End of nested object', {
            currentObjectKey,
            objectValue,
          });
        yield [currentObjectKey, objectValue];
        reset();
        continue;
      }

      if (this.charsNestedArrayEnd.includes(char) && inNestedArray) {
        if (!inNestedArray) {
          throw new Error('Detected end of array while not in array mode');
        }
        inNestedArray = false;
        charIsEndOfNested = true;
        const objectValue = token == null ? {} : shortieToArray(token, true);
        this.#debug &&
          debug('End of nested array', {
            currentObjectKey,
            objectValue,
          });
        yield [currentObjectKey, objectValue];
        reset();
        continue;
      }

      if (inNestedObject || inNestedArray) {
        // We're accumulating
        token = (token ?? '') + char;
        continue;
      }

      // We were in an escape sequence, complete it
      if (escaped) {
        if (inQuote) {
          /*
           * If we are in a quote, just accumulate the whole escape sequence,
           * as we will interpret escape sequences later.
           */
          token = (token ?? '') + escaped + char;
        } else {
          // Just use the literal character
          token = (token ?? '') + char;
        }

        this.#debug && debug('End of escape', { token });
        escaped = false;
        continue;
      }

      if (this.charsEscapes.includes(char)) {
        if (!inQuote || this.charsEscapedQuotes.includes(inQuote)) {
          /*
           * We encountered an escape character, which is going to affect how
           * we treat the next character.
           */
          this.#debug && debug('Begin of escape', { char });
          escaped = char;
          continue;
        } else {
          // This string type doesn't use escape characters. Ignore for now.
        }
      }

      // We were in a string
      if (inQuote != false) {
        // String is finished. Don't grab the quote character.
        if (char == inQuote) {
          token = this.processEscapes(token!, inQuote);
          inQuote = false;
          lastCharWasQuoted = true;
          this.#debug && debug('End of string', { token });
          continue;
        }

        // String isn't finished yet, accumulate the character
        token = (token ?? '') + char;
        continue;
      }

      // This is the start of a new string, don't accumulate the quotation mark
      if (this.charsQuotes.includes(char)) {
        inQuote = char;
        token = token ?? ''; // fixes blank string
        this.#debug && debug('Begin of string', { token });
        continue;
      }

      if (this.charsEquality.includes(char)) {
        if (this.#inArray) {
          throw new Error('Got equality character while being in an array');
        }

        if (!inObjectKey) {
          throw new Error('Got equality character while not in an object key');
        }
        if (token == null) {
          throw new Error('Got equality character before having defined an object key');
        }

        inObjectKey = false;
        currentObjectKey = token;
        token = undefined;
        this.#debug && debug('Begin of object', { currentObjectKey });
        continue;
      }

      if (this.charsNestedObjectBegin.includes(char) && token == undefined) {
        if (inObjectKey) {
          throw new Error('Got object beginning character while in an object key');
        }

        this.#debug && debug('Begin of nested object');
        inNestedObject = true;
        continue;
      }

      if (this.charsNestedArrayBegin.includes(char) && token == undefined) {
        if (inObjectKey) {
          throw new Error('Got array beginning character while in an object key');
        }

        this.#debug && debug('Begin of nested array');
        inNestedArray = true;
        continue;
      }

      // This is whitespace, so yield the token if we have one
      if (this.charsWhitespaces.includes(char)) {
        const value = getValue(lastCharWasQuotedCache);
        this.#debug &&
          debug('Whitespace', {
            currentObjectKey,
            value,
            prevCharWasEndOfNested,
          });
        if (!prevCharWasEndOfNested) {
          yield [currentObjectKey, value];
        }
        reset();
        continue;
      }

      // Otherwise, accumulate the character
      token = (token ?? '') + char;
    }
  }
}

const shortieTag = '__isShortie';

interface ShortieObject {
  [shortieTag]?: true;
}

function setShortieTag(obj: object) {
  Object.defineProperty(obj, shortieTag, {
    enumerable: false,
    writable: false,
    value: true,
  });
}

export function isShortie(obj: object): boolean {
  return obj && Object.prototype.hasOwnProperty.call(obj, shortieTag) && (obj as ShortieObject)[shortieTag] == true;
}

export function shortieToArray(string: string, debug?: boolean): unknown[] {
  const entries = Array.from(new Shortie(string, true, debug));
  const arr: unknown[] = [];
  for (const [key, value] of entries) {
    if (key) {
      throw new Error('Unexpected parsing error, got valid key for array entry');
    }
    arr.push(value);
  }
  setShortieTag(arr);
  return arr;
}

export function shortieToObject(string: string, debug?: boolean): object {
  const entries = Array.from(new Shortie(string, false, debug));
  const obj = Object.fromEntries(entries);
  setShortieTag(obj);
  return obj;
}
