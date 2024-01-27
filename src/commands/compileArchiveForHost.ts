/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { newLogger } from '../util/logger';
import type { HostSourceContext } from '../hostSources/abstractHostSource';
import { InventoryHost } from '../components/inventoryHost';
import '../util/loadAllRegistryEntries.gen';
import type {
  CompileArchiveForHostArgsInterface,
  CompileArchiveForHostResultInterface,
} from './compileArchiveForHost.schema.gen';
import { CompileArchiveForHostArgsSchema } from './compileArchiveForHost.schema';
import { joiAttemptRequired } from '../util/joi';

export async function compileArchiveForHost(
  context: HostSourceContext,
  args: CompileArchiveForHostArgsInterface
): Promise<CompileArchiveForHostResultInterface> {
  args = joiAttemptRequired(args, CompileArchiveForHostArgsSchema);

  const { logger = newLogger() } = context;

  const { hostname, inventory, archive, implicitHosts = [] } = args;

  logger.info('Compiling archive for host', { hostname });

  for (const implicitHost of [...implicitHosts, hostname]) {
    if (inventory.hasHost(implicitHost)) {
      continue;
    }
    inventory.setHost(context, new InventoryHost(implicitHost, {}));
  }

  // const visitedCache: VisitedCache = {groups: {}};
  const archiveForHost = await archive.getArchiveForHostname(context, inventory, hostname);

  return {
    inventory: archiveForHost.inventory,
    archive: archiveForHost.archive,
    stats: archiveForHost.stats.dump(),
  };
}
