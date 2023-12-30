/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import path from 'node:path';

export function normalizePathToUnix(p: string): string {
  return path.normalize(p).replaceAll('\\', '/');
}
