/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

export async function findAsync<T>(arr: T[], asyncCallback: (el: T) => Promise<boolean>): Promise<T | undefined> {
  for (const el of arr) {
    if (await asyncCallback(el)) {
      return el;
    }
  }
  return undefined;
}
