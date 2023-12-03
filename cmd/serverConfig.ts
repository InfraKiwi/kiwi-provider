import { newLoggerFromParseArgs } from '../src/util/logger';
import type { ParseArgsConfig } from 'node:util';
import { parseArgs } from 'node:util';
import { ServerConfig } from '../src/app/serverConfig/serverConfig';
import { loadConfig, parseArgsAppBaseJoiObject, parseArgsAppBaseOptions } from '../src/util/parseArgs';

import '../src/util/loadAllRegistryEntries.gen';
import { ServerConfigConfigSchema } from '../src/app/serverConfig/serverConfig.schema';
import type { ServerConfigConfigInterface } from '../src/app/serverConfig/serverConfig.schema.gen';
import type { AppConfigSchemaInterface } from '../src/app/common/server';
import { getAppConfigSchemaObject, newServer } from '../src/app/common/server';
import { joiAttemptAsync } from '../src/util/joi';
import { setupUncaughtHandler } from '../src/util/uncaught';

const argsConfig: ParseArgsConfig = {
  allowPositionals: false,
  strict: true,
  options: {
    ...parseArgsAppBaseOptions,
  },
};

async function main() {
  const {
    // positionals,
    values,
  } = parseArgs(argsConfig);

  const { configPath, ...otherArgs } = await joiAttemptAsync(
    values,
    parseArgsAppBaseJoiObject,
    'Error evaluating command args:',
  );
  const logger = newLoggerFromParseArgs(otherArgs);
  setupUncaughtHandler(logger);

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
