/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { TenInfraInfoInterface } from './10infra.schema.gen';

let tenInfraInfoObj: TenInfraInfoInterface | undefined;

export function set10InfraInfo(info: TenInfraInfoInterface) {
  tenInfraInfoObj = info;
}

export function get10InfraInfo(): TenInfraInfoInterface {
  if (tenInfraInfoObj == null) {
    throw new Error(`Undefined tenInfraInfoObj`);
  }
  return tenInfraInfoObj;
}
