/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function expectCatch<T = unknown>(actual: T, err: any) {
  // eslint-disable-next-line jest/valid-expect
  return expect(actual, err.toString());
}
