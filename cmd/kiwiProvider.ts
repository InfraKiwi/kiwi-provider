/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { cliContextLoggerFromArgs } from '../src/util/logger';
import type { ParseArgsConfig } from 'node:util';
import { parseArgs } from 'node:util';
import { KiwiProvider } from '../src/app/kiwiProvider/kiwiProvider';
import { loadConfig, parseArgsAppBaseJoiObject, parseArgsAppBaseOptions } from '../src/util/parseArgs';

import '../src/util/loadAllRegistryEntries.gen';
import { ProviderAppConfigSchema } from '../src/app/kiwiProvider/kiwiProvider.schema';
import type { KiwiProviderConfigInterface } from '../src/app/kiwiProvider/kiwiProvider.schema.gen';
import type { AppConfigSchemaInterface } from '../src/app/common/server';
import { appListen } from '../src/app/common/server';
import { newServer } from '../src/app/common/server';
import Joi from 'joi';
import { joiAttemptRequired } from '../src/util/joi';
import { setKiwiInfo } from '../src/util/kiwi';
import { argvFrom2 } from '../src/util/args';
import type { Server } from 'node:http';

const argsConfig: ParseArgsConfig = {
  allowPositionals: false,
  strict: true,
  options: { ...parseArgsAppBaseOptions },
};

const appName = 'kiwi-provider';

export async function mainKiwiProvider(args = argvFrom2()): Promise<Server> {
  const {
    // positionals,
    values,
  } = parseArgs({
    ...argsConfig,
    args,
  });

  const { configFile, ...otherArgs } = joiAttemptRequired(
    values,
    parseArgsAppBaseJoiObject,
    'Error evaluating command args:'
  );
  const context = cliContextLoggerFromArgs(otherArgs);

  setKiwiInfo({
    appName,
    configFile,
  });

  const config = await loadConfig<AppConfigSchemaInterface<KiwiProviderConfigInterface>>(
    configFile,
    ProviderAppConfigSchema
  );
  const externalUrl = joiAttemptRequired(
    config.listener?.externalUrl,
    Joi.string().uri(),
    'The externalUrl config option must be defined'
  );
  const kiwiProvider = new KiwiProvider(context.logger, config.app, externalUrl);

  const app = newServer(context, {});

  await kiwiProvider.initialize();
  kiwiProvider.mountRoutes(app);

  if (config.listener == null) {
    throw new Error(`Null config.listener`);
  }
  return await appListen(context, app, config.listener);
}

if (require.main == module) {
  void mainKiwiProvider();
}
