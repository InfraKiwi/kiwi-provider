import { Inventory } from '../components/inventory';
import fs from 'node:fs';
import type { InventoryInterface } from '../components/inventory.schema.gen';
import { tryOrThrowAsync } from '../util/try';
import type { RecipeCtorContext } from '../components/recipe';
import { Recipe } from '../components/recipe';
import type { MyPartialRunContextOmit } from '../util/runContext';
import { RunContext } from '../util/runContext';
import { loadYAML } from '../util/yaml';
import type { VarsInterface } from '../components/varsContainer.schema.gen';
import { InventoryHost } from '../components/inventoryHost';

import type { DataSourceContext } from '../dataSources/abstractDataSource';
import { groupNameAll } from '../components/inventory.schema';

export interface RunRecipeArgs {
  recipePath: string;
  hostname: string;

  inventoryPath?: string;

  runContextPartial?: Partial<MyPartialRunContextOmit>;
}

async function loadInventory(context: DataSourceContext, inventoryPath?: string): Promise<Inventory> {
  let inventory: Inventory;
  {
    if (inventoryPath) {
      const data = loadYAML(fs.readFileSync(inventoryPath, 'utf8'));
      inventory = new Inventory(data as InventoryInterface);
    } else {
      inventory = new Inventory({});
    }
  }
  await inventory.loadGroupsAndStubs(context);
  return inventory;
}

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

export async function runRecipe(context: RecipeCtorContext, args: RunRecipeArgs) {
  const inventory = await loadInventory(context, args.inventoryPath);

  // Load recipe
  const recipe = await tryOrThrowAsync(() => Recipe.fromPath(context, args.recipePath), 'Failed to load recipe');

  const hosts = inventory.getHostsByPattern(args.hostname);
  const hostnames = Object.keys(hosts);
  if (hostnames.length == 0) {
    if (recipe.targets.length == 0 || recipe.targets.includes(groupNameAll)) {
      // This recipe will be run in any case because the recipe does not specify any targets
      const host = new InventoryHost(args.hostname, {});
      inventory.setHost(host);
      hosts[args.hostname] = host;
      hostnames.push(args.hostname);
    } else {
      throw new Error('The recipe needs to be run on a single host, 0 found');
    }
  }
  if (hostnames.length > 1) {
    throw new Error(`The recipe can be run only as a single host, ${hostnames.length} found`);
  }

  const host = hosts[hostnames[0]];

  const otherHosts = inventory.getHostsByPattern(recipe.config.otherHosts ?? []);
  for (const otherHostsKey in otherHosts) {
    await otherHosts[otherHostsKey].loadVars(context);
  }

  const runContext = new RunContext(host, {
    ...context,
    ...args.runContextPartial,
  })
    .withLoggerFields({
      hostname: host.id,
    })
    .withForcedVars(
      aggregateForcedContextVars({
        inventory,
        host,
      }),
    );

  // Process variables from inventory
  const hostVars = await inventory.aggregateBaseVarsForHost(host);
  Object.assign(runContext.vars, hostVars);
  await recipe.run(runContext);
}
