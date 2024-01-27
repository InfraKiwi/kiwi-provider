/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

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
import { appListen } from '../src/app/common/server';
import { getAppConfigSchemaObject, newServer } from '../src/app/common/server';
import { setupUncaughtHandler } from '../src/util/uncaught';
import { localhost127 } from '../src/util/constants';
import Joi from 'joi';
import { joiAttemptRequired } from '../src/util/joi';
import { set10InfraInfo } from '../src/util/10infra';

const argsConfig: ParseArgsConfig = {
  allowPositionals: false,
  strict: true,
  options: { ...parseArgsAppBaseOptions },
};

const appName = '10infra-configProvider';

async function main() {
  const {
    // positionals,
    values,
  } = parseArgs(argsConfig);

  const { configPath, ...otherArgs } = joiAttemptRequired(
    values,
    parseArgsAppBaseJoiObject,
    'Error evaluating command args:'
  );
  const logger = newLoggerFromParseArgs(otherArgs);
  setupUncaughtHandler(logger);

  set10InfraInfo({
    appName,
    configPath,
  });

  const schema = getAppConfigSchemaObject(ConfigProviderConfigSchema, {
    addr: localhost127,
    port: ConfigProviderListenerDefaultPort,
  });
  const config = await loadConfig<AppConfigSchemaInterface<ConfigProviderConfigInterface>>(configPath, schema);
  const externalUrl = joiAttemptRequired(
    config.listener.externalUrl,
    Joi.string().uri(),
    'The externalUrl config option must be defined'
  );
  const configProvider = new ConfigProvider(logger, config.app, externalUrl);

  const app = newServer({ logger }, {});

  await configProvider.initialize();
  configProvider.mountRoutes(app);

  appListen({ logger }, app, config.listener);
}

void main();
