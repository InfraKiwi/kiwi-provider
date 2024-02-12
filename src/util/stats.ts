/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { ContextLogger } from './context';

export type StatsDump = Record<string, number>;

export class Stats {
  #stats: Record<string, number> = {};

  async measureBlock<T>(context: ContextLogger, label: string, fn: () => T | Promise<T>): Promise<T> {
    const startTime = new Date().getTime();
    // context.logger.verbose(`measureBlock[start]: ${label}`);
    const result = await fn();
    const endTime = new Date().getTime();
    const diff = endTime - startTime;
    // context.logger.verbose(`measureBlock[end]: ${label}`);

    this.#stats[label] = diff;
    return result;
  }

  dump(): StatsDump {
    return { ...this.#stats };
  }
}
