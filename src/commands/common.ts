/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { VarsInterface } from '../components/varsContainer.schema.gen';
import type { Inventory } from '../components/inventory';
import type { InventoryHost } from '../components/inventoryHost';

export interface ForcedContextVars {
  inventory: Inventory;
  host: InventoryHost;
}

// Simple utility function to make sure we always pass the right vars and don't forget about them
export function aggregateForcedContextVars(vars: ForcedContextVars): VarsInterface {
  return {
    ...vars,
    hostname: vars.host.id,
  };
}
