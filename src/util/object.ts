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
