import { newLogger, setGlobalLogLevel } from '../src/util/logger';
import type { ParseArgsConfig } from 'node:util';
import { parseArgs } from 'node:util';
import { ServerConfig } from '../src/app/serverConfig/serverConfig';
import { loadConfig, parseArgsBaseJoiObject, parseArgsBaseOptions } from '../src/util/parseArgs';

import '../src/util/loadAllRegistryEntries.gen';
import { ServerConfigConfigSchema } from '../src/app/serverConfig/serverConfig.schema';
import type { ServerConfigConfigInterface } from '../src/app/serverConfig/serverConfig.schema.gen';
import type { AppConfigSchemaInterface } from '../src/app/common/server';
import { getAppConfigSchemaObject, newServer } from '../src/app/common/server';
import { joiAttemptAsync } from '../src/util/joi';
import { setupUncaughtHandler } from '../src/util/uncaught';

const logger = newLogger();
setupUncaughtHandler(logger);

const argsConfig: ParseArgsConfig = {
  allowPositionals: false,
  strict: true,
  options: {
    ...parseArgsBaseOptions,
  },
};

async function main() {
  const {
    // positionals,
    values,
  } = parseArgs(argsConfig);

  const { logLevel, configPath } = await joiAttemptAsync(
    values,
    parseArgsBaseJoiObject,
    'Error evaluating command args:',
  );
  setGlobalLogLevel(logLevel);

  const schema = getAppConfigSchemaObject(ServerConfigConfigSchema, { port: 3000 });
  const config = await loadConfig<AppConfigSchemaInterface<ServerConfigConfigInterface>>(configPath, schema);
  const serverConfig = new ServerConfig(logger, config.app);

  const app = newServer(
    {
      logger,
    },
    {},
  );

  await serverConfig.initialize();
  serverConfig.mountRoutes(app);

  const server = app.listen(config.listener.port, config.listener.addr, () => {
    logger.info(`Server listening`, { address: server.address() });
  });
}

void main();
