/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

export type StatsDump = Record<string, number>;

export class Stats {
  #stats: Record<string, number> = {};

  async measureBlock<T>(label: string, fn: () => T | Promise<T>): Promise<T> {
    const startTime = new Date().getTime();

    const result = await fn();

    this.#stats[label] = new Date().getTime() - startTime;
    return result;
  }

  dump(): StatsDump {
    return { ...this.#stats };
  }
}
