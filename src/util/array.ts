/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

export type RecursiveArray<T> = (RecursiveArray<T> | T)[];

export function getArrayFromSingleOrArray<T>(val: T | T[]): T[] {
  return Array.isArray(val) ? val : [val];
}

export function arrayCompare<T>(arr: T[], other: T[]): boolean {
  return arr.length == other.length && arr.every((subElement, index) => other.at(index) == subElement);
}
