import { newLoggerFromParseArgs } from '../src/util/logger';
import type { ParseArgsConfig } from 'node:util';
import { parseArgs } from 'node:util';
import type { AppConfigSchemaInterface } from '../src/app/common/server';
import { getAppConfigSchemaObject, newServer } from '../src/app/common/server';
import { ServerWorker } from '../src/app/serverWorker/serverWorker';
import { loadConfig, parseArgsAppBaseJoiObject, parseArgsAppBaseOptions } from '../src/util/parseArgs';
import '../src/util/loadAllRegistryEntries.gen';
import type { ServerWorkerConfigInterface } from '../src/app/serverWorker/serverWorker.schema.gen';
import { ServerWorkerConfigSchema } from '../src/app/serverWorker/serverWorker.schema';
import { joiAttemptAsync } from '../src/util/joi';
import { setupUncaughtHandler } from '../src/util/uncaught';
import { checkVersionCommand } from '../src/util/args';

const argsConfig: ParseArgsConfig = {
  allowPositionals: false,
  strict: true,
  options: {
    ...parseArgsAppBaseOptions,
  },
};

async function main() {
  checkVersionCommand();

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

  const schema = getAppConfigSchemaObject(ServerWorkerConfigSchema, { port: 3001 });
  const config = await loadConfig<AppConfigSchemaInterface<ServerWorkerConfigInterface>>(configPath, schema);
  const serverWorker = new ServerWorker(logger, config.app);

  const app = newServer(
    {
      logger,
    },
    {},
  );

  serverWorker.mountRoutes(app);

  const server = app.listen(config.listener.port, config.listener.addr, () => {
    logger.info(`Server listening`, { address: server.address(), config });
  });
}

void main();
