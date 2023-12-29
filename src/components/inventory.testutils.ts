/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { MyPartialRunContextOmit } from '../util/runContext';
import { RunContext } from '../util/runContext';
import { InventoryHost } from './inventoryHost';

export function getTestHost(): InventoryHost {
  return new InventoryHost('test', {});
}

export function getTestRunContext(partial?: Partial<MyPartialRunContextOmit>): RunContext {
  return new RunContext(getTestHost(), partial);
}
