/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { createHash } from 'node:crypto';

export function sha1Hex(str: string): string {
  return createHash('sha1').update(str).digest('hex');
}

export function sha256Hex(str: string): string {
  return createHash('sha256').update(str).digest('hex');
}
