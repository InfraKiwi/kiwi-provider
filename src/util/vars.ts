import type { InventoryHost } from '../components/inventoryHost';
import type { HostVarsBlockInterface } from '../components/recipe.schema.gen';
import type { VarsInterface } from '../components/varsContainer.schema.gen';
import { objectIsEmpty } from './object';

export function filterHostVarsBlockForHost(
  host: InventoryHost,
  hostVarsBlock: HostVarsBlockInterface,
): HostVarsBlockInterface {
  /*
   * TODO
   * TODO
   * TODO
   * TODO potentially support pattern matching for group vars and/or host vars
   * TODO
   * TODO
   * TODO
   */

  const allGroupVars: Record<string, VarsInterface> = {};
  const allHostVars: Record<string, VarsInterface> = {};

  for (const groupName of host.groupNames) {
    const groupVars = hostVarsBlock.groupVars?.[groupName];
    if (groupVars && !objectIsEmpty(groupVars)) {
      allGroupVars[groupName] ??= {};
      Object.assign(allGroupVars[groupName], groupVars);
    }
  }

  const hostVars = hostVarsBlock.hostVars?.[host.id];
  if (hostVars && !objectIsEmpty(hostVars)) {
    allHostVars[host.id] = hostVars;
  }

  const varsBlock: HostVarsBlockInterface = {
    groupVars: !objectIsEmpty(allGroupVars) ? allGroupVars : undefined,
    hostVars: !objectIsEmpty(allHostVars) ? allHostVars : undefined,
  };
  return varsBlock;
}
