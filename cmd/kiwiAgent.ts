/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { NewLoggerArgs } from '../src/util/logger';
import {
  cliContextLoggerFromArgs,
  joiParseArgsLogOptions,
  joiParseArgsLogOptionsSchema,
  parseArgsLogOptions,
} from '../src/util/logger';
import type { ParseArgsConfig } from 'node:util';
import { parseArgs } from 'node:util';
import type { AppConfigSchemaInterface } from '../src/app/common/server';
import { appListen, newServer } from '../src/app/common/server';
import { KiwiAgent } from '../src/app/kiwiAgent/kiwiAgent';
import { loadConfig, parseArgsAppBaseJoiObject, parseArgsAppBaseOptions } from '../src/util/parseArgs';
import '../src/util/loadAllRegistryEntries.gen';
import type { AgentConfigInterface } from '../src/app/kiwiAgent/kiwiAgent.schema.gen';
import { AgentAppConfigSchema } from '../src/app/kiwiAgent/kiwiAgent.schema';
import { argvFrom2, checkVersionCommand } from '../src/util/args';
import { agentBootstrapConfig } from '../src/app/kiwiAgent/kiwiAgent.bootstrap';
import {
  AgentBootstrapConfigParseArgsOptions,
  AgentBootstrapConfigSchema,
} from '../src/app/kiwiAgent/kiwiAgent.bootstrap.schema';
import { joiAttemptRequired, joiKeepOnlyKeysInJoiSchema } from '../src/util/joi';
import type { AgentBootstrapConfigInterface } from '../src/app/kiwiAgent/kiwiAgent.bootstrap.schema.gen';
import { RecipePhase } from '../src/components/recipe.schema';
import { setKiwiInfo } from '../src/util/kiwi';

enum MainCommand {
  bootstrap = 'bootstrap',
  serve = 'serve',
}

const appName = 'kiwi-kiwiAgent';

export async function mainAgent(args = argvFrom2()) {
  checkVersionCommand();

  const mainCommand = args[0] as MainCommand;
  const mainCommandArgs = args.slice(1);

  switch (mainCommand) {
    case MainCommand.bootstrap:
      return commandBootstrap(mainCommandArgs);
    case MainCommand.serve:
      return commandServe(mainCommandArgs);
    default:
      throw new Error(`Invalid command ${mainCommand as string}. Supported: ${Object.values(MainCommand).join(',')}`);
  }
}

async function commandBootstrap(args: string[]) {
  const argsConfig: ParseArgsConfig = {
    allowPositionals: false,
    strict: true,
    args,
    options: {
      ...parseArgsLogOptions,
      ...AgentBootstrapConfigParseArgsOptions,
    },
  };

  const {
    // positionals,
    values,
  } = parseArgs(argsConfig);

  const allArgs = joiAttemptRequired(
    values,
    AgentBootstrapConfigSchema.append(joiParseArgsLogOptions),
    'Error evaluating command args:'
  );
  const otherArgs = joiKeepOnlyKeysInJoiSchema<NewLoggerArgs>(allArgs, joiParseArgsLogOptionsSchema);
  const context = cliContextLoggerFromArgs(otherArgs);

  const boostrapConfig = joiKeepOnlyKeysInJoiSchema<AgentBootstrapConfigInterface>(allArgs, AgentBootstrapConfigSchema);
  const configFile = await agentBootstrapConfig(context, boostrapConfig);

  setKiwiInfo({
    appName,
    configFile,
  });

  const config = await loadConfig<AppConfigSchemaInterface<AgentConfigInterface>>(configFile, AgentAppConfigSchema);
  const agent = new KiwiAgent(context.logger, config.app);

  const reloadResult = await agent.reloadRelease(RecipePhase.bootstrap, true);
  context.logger.info('Processed first release', { result: reloadResult });
}

async function commandServe(args: string[]) {
  const argsConfig: ParseArgsConfig = {
    allowPositionals: false,
    strict: true,
    args,
    options: { ...parseArgsAppBaseOptions },
  };

  const {
    // positionals,
    values,
  } = parseArgs(argsConfig);

  const { configFile, ...otherArgs } = joiAttemptRequired(
    values,
    parseArgsAppBaseJoiObject,
    'Error evaluating command args:'
  );
  const context = cliContextLoggerFromArgs(otherArgs);

  const config = await loadConfig<AppConfigSchemaInterface<AgentConfigInterface>>(configFile, AgentAppConfigSchema);

  setKiwiInfo({
    appName,
    configFile,
  });

  const agent = new KiwiAgent(context.logger, config.app);

  const app = newServer(context, {});

  agent.mountRoutes(app);
  if (config.listener == null) {
    throw new Error(`Null config.listener`);
  }
  await appListen(context, app, config.listener);
}

if (require.main == module) {
  void mainAgent();
}
