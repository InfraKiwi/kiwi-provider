/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { KiwiInfoInterface } from './kiwi.schema.gen';

let kiwiInfoObj: KiwiInfoInterface | undefined;

export function setKiwiInfo(info: KiwiInfoInterface) {
  kiwiInfoObj = info;
}

export function getKiwiInfo(): KiwiInfoInterface {
  if (kiwiInfoObj == null) {
    throw new Error(`Undefined kiwiInfoObj`);
  }
  return kiwiInfoObj;
}
