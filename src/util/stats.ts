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
