/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, test } from '@jest/globals';
import { promiseRetry } from './promise';

describe('promise test', () => {
  test('retry', async () => {
    let tries = 0;
    let counter = 3;
    // Expect 3 failures
    const fn = async () => {
      expect(counter).toEqual(3 - tries);
      counter--;
      tries++;
      if (counter > 0) {
        throw new Error(`Retry failure number ${tries}`);
      }
    };

    await promiseRetry(fn, { maxRetries: 4 });

    counter = 3;
    tries = 0;
    await expect(promiseRetry(fn, { maxRetries: 2 })).rejects.toThrowError();
  });
});
