export function deepcopy<T>(val: T): T {
  return JSON.parse(JSON.stringify(val));
}
