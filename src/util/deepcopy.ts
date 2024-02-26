/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

export function deepcopy<T>(val: T): T {
  return JSON.parse(JSON.stringify(val));
}
