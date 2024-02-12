/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { promiseWait } from './timeout';

export interface PromiseRetryOptions {
  maxRetries: number;
  delayMs?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError?: (err: any, maxRetries: number) => any;
}

export async function promiseRetry<T>(executor: () => Promise<T>, options: PromiseRetryOptions): Promise<T> {
  try {
    return await executor();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (options.onError) {
      await options.onError(err, options.maxRetries);
    }
    if (options.delayMs) {
      await promiseWait(options.delayMs);
    }
    const maxRetries = options.maxRetries - 1;
    if (maxRetries == 0) {
      throw err;
    }
    return promiseRetry(executor, {
      ...options,
      maxRetries,
    });
  }
}
