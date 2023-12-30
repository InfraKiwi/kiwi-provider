/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

export function objectIsEmpty(obj: object): boolean {
  for (const objKey in obj) {
    return false;
  }
  return true;
}

export function pick<Data extends object, PickKeys extends keyof Data>(
  data: Data,
  keys: PickKeys[]
): Pick<Data, PickKeys> {
  const result = {} as Pick<Data, PickKeys>;

  for (const key of keys) {
    result[key] = data[key];
  }

  return result;
}

export function omit<Data extends object, OmitKeys extends keyof Data>(
  data: Data,
  keys: OmitKeys[]
): Omit<Data, OmitKeys> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = {};

  const objKeys = Object.keys(data);
  for (const key of objKeys) {
    if (keys.includes(key as OmitKeys)) {
      continue;
    }
    result[key] = data[key as keyof Omit<Data, OmitKeys>];
  }

  return result as Omit<Data, OmitKeys>;
}
