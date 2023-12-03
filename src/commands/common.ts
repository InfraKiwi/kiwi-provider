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
