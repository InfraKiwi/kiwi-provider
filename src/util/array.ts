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

export function arrayStartsWith<T>(arr: T[], subset: T[], compareFn?: (a: T, b: T) => boolean): boolean {
  if (subset.length > arr.length) {
    return false;
  }
  for (let i = 0; i < subset.length; i++) {
    if (compareFn) {
      if (!compareFn(arr[i], subset[i])) {
        return false;
      }
    } else if (arr[i] != subset[i]) {
      return false;
    }
  }
  return true;
}

export function arraySubsetIterate<T>(arr: T[], subsetLength: number, it: (a: T[]) => boolean): boolean {
  if (subsetLength > arr.length) {
    return false;
  }

  // Which index to start the scan from
  for (let startIndex = 0; startIndex <= arr.length - subsetLength; startIndex++) {
    if (it(arr.slice(startIndex, startIndex + subsetLength))) {
      return true;
    }
  }

  return false;
}

export function arrayContainsSubset<T>(arr: T[], subset: T[], compareFn?: (a: T, b: T) => boolean): boolean {
  if (subset.length > arr.length) {
    return false;
  }

  // Which index to start the scan from
  for (let startIndex = 0; startIndex <= arr.length - subset.length; startIndex++) {
    let match = true;
    for (let i = startIndex; i < subset.length; i++) {
      if (compareFn) {
        if (!compareFn(arr[i], subset[i])) {
          match = false;
        }
      } else if (arr[i] != subset[i]) {
        match = false;
      }
      if (!match) {
        break;
      }
    }
    if (match) {
      return true;
    }
  }

  return false;
}
