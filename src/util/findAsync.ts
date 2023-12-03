export async function findAsync<T>(arr: T[], asyncCallback: (el: T) => Promise<boolean>): Promise<T | undefined> {
  for (const el of arr) {
    if (await asyncCallback(el)) {
      return el;
    }
  }
  return undefined;
}
