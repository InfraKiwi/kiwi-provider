/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { NewLoggerArgs } from '../src/util/logger';
import {
  joiParseArgsLogOptions,
  joiParseArgsLogOptionsSchema,
  newLoggerFromParseArgs,
  parseArgsLogOptions,
} from '../src/util/logger';
import type { ParseArgsConfig } from 'node:util';
import { parseArgs } from 'node:util';
import type { AppConfigSchemaInterface } from '../src/app/common/server';
import { appListen, getAppConfigSchemaObject, newServer } from '../src/app/common/server';
import { Agent } from '../src/app/agent/agent';
import { loadConfig, parseArgsAppBaseJoiObject, parseArgsAppBaseOptions } from '../src/util/parseArgs';
import '../src/util/loadAllRegistryEntries.gen';
import type { AgentConfigInterface } from '../src/app/agent/agent.schema.gen';
import { AgentConfigSchema, AgentListenerDefaultPort } from '../src/app/agent/agent.schema';
import { setupUncaughtHandler } from '../src/util/uncaught';
import { checkVersionCommand } from '../src/util/args';
import { agentBootstrapConfig } from '../src/app/agent/agent.bootstrap';
import {
  AgentBootstrapConfigParseArgsOptions,
  AgentBootstrapConfigSchema,
} from '../src/app/agent/agent.bootstrap.schema';
import { joiAttemptRequired, joiKeepOnlyKeysInJoiSchema } from '../src/util/joi';
import type { AgentBootstrapConfigInterface } from '../src/app/agent/agent.bootstrap.schema.gen';
import { RecipePhase } from '../src/components/recipe.schema';
import { set10InfraInfo } from '../src/util/10infra';

const agentAppConfigSchema = getAppConfigSchemaObject(AgentConfigSchema, { port: AgentListenerDefaultPort });

enum MainCommand {
  bootstrap = 'bootstrap',
  serve = 'serve',
}

const appName = '10infra-agent';

async function main() {
  checkVersionCommand();

  const args = process.argv.slice(2);
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
  const logArgs = joiKeepOnlyKeysInJoiSchema<NewLoggerArgs>(allArgs, joiParseArgsLogOptionsSchema);
  const logger = newLoggerFromParseArgs(logArgs);
  setupUncaughtHandler(logger);

  const boostrapConfig = joiKeepOnlyKeysInJoiSchema<AgentBootstrapConfigInterface>(allArgs, AgentBootstrapConfigSchema);
  const configPath = await agentBootstrapConfig({ logger }, boostrapConfig);

  set10InfraInfo({
    appName,
    configPath,
  });

  const config = await loadConfig<AppConfigSchemaInterface<AgentConfigInterface>>(configPath, agentAppConfigSchema);
  const agent = new Agent(logger, config.app);

  const reloadResult = await agent.reloadRelease(RecipePhase.bootstrap, true);
  logger.info('Processed first release', { result: reloadResult });
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

  const { configPath, ...otherArgs } = joiAttemptRequired(
    values,
    parseArgsAppBaseJoiObject,
    'Error evaluating command args:'
  );
  const logger = newLoggerFromParseArgs(otherArgs);
  setupUncaughtHandler(logger);

  const config = await loadConfig<AppConfigSchemaInterface<AgentConfigInterface>>(configPath, agentAppConfigSchema);

  set10InfraInfo({
    appName,
    configPath,
  });

  const agent = new Agent(logger, config.app);

  const app = newServer({ logger }, {});

  agent.mountRoutes(app);
  appListen({ logger }, app, config.listener);
}

void main();
