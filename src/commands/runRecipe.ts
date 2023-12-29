/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { Inventory } from '../components/inventory';
import type { Recipe } from '../components/recipe';
import type { MyPartialRunContextOmit } from '../util/runContext';
import { RunContext } from '../util/runContext';
import type { DataSourceContext } from '../dataSources/abstractDataSource';
import { groupNameAll } from '../components/inventory.schema';
import { InventoryHost } from '../components/inventoryHost';
import { aggregateForcedContextVars } from './common';

export interface RunRecipeArgs {
  hostname: string;
  inventory: Inventory;
  recipe: Recipe;
  runContextPartial?: Partial<MyPartialRunContextOmit>;
}

export async function runRecipe(
  context: DataSourceContext & Partial<MyPartialRunContextOmit>,
  { hostname, inventory, recipe, runContextPartial }: RunRecipeArgs
): Promise<void> {
  const hosts = inventory.getHostsByPattern(context, hostname);
  const hostnames = Object.keys(hosts);
  if (hostnames.length == 0) {
    if (recipe.targets.length == 0 || recipe.targets.includes(groupNameAll)) {
      // This recipe will be run in any case because the recipe does not specify any targets
      const host = new InventoryHost(hostname, {});
      inventory.setHost(context, host);
      hosts[hostname] = host;
      hostnames.push(hostname);
    } else {
      throw new Error('The recipe needs to be run on a single host, 0 found');
    }
  }
  if (hostnames.length > 1) {
    throw new Error(`The recipe can be run only as a single host, ${hostnames.length} found`);
  }

  const host = hosts[hostnames[0]];
  await host.loadVars(context);

  const otherHosts = inventory.getHostsByPattern(context, recipe.config.otherHosts ?? []);
  for (const otherHostsKey in otherHosts) {
    await otherHosts[otherHostsKey].loadVars(context);
  }

  const runContext = new RunContext(host, {
    ...context,
    ...runContextPartial,
  })
    .withLoggerFields({ hostname: host.id })
    .withForcedVars(
      aggregateForcedContextVars({
        inventory,
        host,
      })
    );

  // Process variables from inventory
  const hostVars = await inventory.aggregateBaseVarsForHost(context, host);
  Object.assign(runContext.vars, hostVars);
  await recipe.run(runContext);
}
