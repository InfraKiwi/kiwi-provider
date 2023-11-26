export function promiseOrThrowOnTimeout<T>(prom: Promise<T>, timeMs: number) {
  return Promise.race([prom, new Promise((_r, rej) => setTimeout(rej, timeMs))]);
}

export function promiseWait(timeMs: number) {
  return new Promise((res, rej) => setTimeout(res, timeMs));
}
