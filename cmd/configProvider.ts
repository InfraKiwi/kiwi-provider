import { newLoggerFromParseArgs } from '../src/util/logger';
import type { ParseArgsConfig } from 'node:util';
import { parseArgs } from 'node:util';
import { ConfigProvider } from '../src/app/configProvider/configProvider';
import { loadConfig, parseArgsAppBaseJoiObject, parseArgsAppBaseOptions } from '../src/util/parseArgs';

import '../src/util/loadAllRegistryEntries.gen';
import {
  ConfigProviderConfigSchema,
  ConfigProviderListenerDefaultPort,
} from '../src/app/configProvider/configProvider.schema';
import type { ConfigProviderConfigInterface } from '../src/app/configProvider/configProvider.schema.gen';
import type { AppConfigSchemaInterface } from '../src/app/common/server';
import { getAppConfigSchemaObject, newServer } from '../src/app/common/server';
import { setupUncaughtHandler } from '../src/util/uncaught';
import { localhost127 } from '../src/util/constants';
import Joi from 'joi';

const argsConfig: ParseArgsConfig = {
  allowPositionals: false,
  strict: true,
  options: { ...parseArgsAppBaseOptions },
};

async function main() {
  const {
    // positionals,
    values,
  } = parseArgs(argsConfig);

  const { configPath, ...otherArgs } = Joi.attempt(values, parseArgsAppBaseJoiObject, 'Error evaluating command args:');
  const logger = newLoggerFromParseArgs(otherArgs);
  setupUncaughtHandler(logger);

  const schema = getAppConfigSchemaObject(ConfigProviderConfigSchema, {
    addr: localhost127,
    port: ConfigProviderListenerDefaultPort,
  });
  const config = await loadConfig<AppConfigSchemaInterface<ConfigProviderConfigInterface>>(configPath, schema);
  const externalUrl = Joi.attempt(
    config.listener.externalUrl,
    Joi.string().uri(),
    'The externalUrl config option must be defined',
  );
  const configProvider = new ConfigProvider(logger, config.app, externalUrl);

  const app = newServer({ logger }, {});

  await configProvider.initialize();
  configProvider.mountRoutes(app);

  const server = app.listen(config.listener.port, config.listener.addr ?? localhost127, () => {
    logger.info(`Server listening`, { address: server.address() });
  });
}

void main();
