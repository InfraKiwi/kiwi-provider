/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { ValidationError } from 'joi';
import { areWeTestingWithJest } from './constants';

function getErrorDescription(err: Error): string {
  if (err instanceof ValidationError) {
    return [err.message, err.annotate(true)].join('\n');
  }

  return ''; // `${err}${err.stack ? '\n' + err.stack : ''}`;
}

export async function tryOrThrowAsync<T>(
  fn: () => Promise<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wrapMessage: string | ((err: any) => string)
): Promise<T> {
  // Jest masks too many errors
  if (areWeTestingWithJest()) {
    return await fn();
  }

  try {
    return await fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const msgPrefix = typeof wrapMessage == 'function' ? wrapMessage(err) : wrapMessage;
    const moreDescription = getErrorDescription(err);
    throw new Error(msgPrefix + (moreDescription ? `\nCaused by: ${moreDescription}` : ''), { cause: err });
  }
}
export function tryOrThrow<T>(
  fn: () => T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wrapMessage: string | ((err: any) => string)
): T {
  // Jest masks too many errors
  if (areWeTestingWithJest()) {
    return fn();
  }

  try {
    return fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const msgPrefix = typeof wrapMessage == 'function' ? wrapMessage(err) : wrapMessage;
    const moreDescription = getErrorDescription(err);
    throw new Error(msgPrefix + (moreDescription ? `\nCaused by: ${moreDescription}` : ''), { cause: err });
  }
}
