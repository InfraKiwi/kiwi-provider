/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

export function promiseOrThrowOnTimeout<T>(prom: Promise<T>, timeMs: number) {
  return Promise.race([prom, new Promise((_r, rej) => setTimeout(rej, timeMs))]);
}

export function promiseWait(timeMs: number) {
  return new Promise((res, rej) => setTimeout(res, timeMs));
}
