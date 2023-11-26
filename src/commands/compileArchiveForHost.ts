import { newDebug } from '../util/debug';
import { newLogger } from '../util/logger';
import type { HostSourceContext } from '../hostSources/abstractHostSource';
import { InventoryHost } from '../components/inventoryHost';
import '../util/loadAllRegistryEntries.gen';
import type {
  CompileArchiveForHostArgsInterface,
  CompileArchiveForHostResultInterface,
} from './compileArchiveForHost.schema.gen';
import Joi from 'joi';
import { CompileArchiveForHostArgsSchema } from './compileArchiveForHost.schema';

const debug = newDebug(__filename);

export async function compileArchiveForHost(
  context: HostSourceContext,
  args: CompileArchiveForHostArgsInterface,
): Promise<CompileArchiveForHostResultInterface> {
  args = Joi.attempt(args, CompileArchiveForHostArgsSchema);

  let { logger } = context;
  logger ??= newLogger();

  const { hostname, inventory, archive, implicitHosts } = args;

  logger.info(`Compiling archive for host`, { hostname });

  for (const implicitHost of [...(implicitHosts ?? []), hostname]) {
    if (inventory.hasHost(implicitHost)) {
      continue;
    }
    inventory.setHost(new InventoryHost(implicitHost, {}));
  }

  // const visitedCache: VisitedCache = {groups: {}};
  const archiveForHost = await archive.getArchiveForHostname(context, inventory, hostname);

  return {
    inventory: archiveForHost.inventory,
    archive: archiveForHost.archive,
    stats: archiveForHost.stats.dump(),
  };
}
