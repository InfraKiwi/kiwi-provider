/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import util from 'node:util';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function inspect(obj: any): string {
  return util.inspect(obj, { depth: null });
}
