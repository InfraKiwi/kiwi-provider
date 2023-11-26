export function objectIsEmpty(obj: object): boolean {
  for (const objKey in obj) {
    return false;
  }
  return true;
}
