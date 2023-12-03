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
import { getAppConfigSchemaObject, newServer } from '../src/app/common/server';
import { Agent } from '../src/app/agent/agent';
import { loadConfig, parseArgsAppBaseJoiObject, parseArgsAppBaseOptions } from '../src/util/parseArgs';
import '../src/util/loadAllRegistryEntries.gen';
import type { AgentConfigInterface } from '../src/app/agent/agent.schema.gen';
import { AgentConfigSchema, AgentListenerDefaultPort } from '../src/app/agent/agent.schema';
import { setupUncaughtHandler } from '../src/util/uncaught';
import { checkVersionCommand } from '../src/util/args';
import { localhost127 } from '../src/util/constants';
import Joi from 'joi';
import { agentBootstrapConfig } from '../src/app/agent/agent.bootstrap';
import {
  AgentBootstrapConfigParseArgsOptions,
  AgentBootstrapConfigSchema,
} from '../src/app/agent/agent.bootstrap.schema';
import { joiKeepOnlyKeysInJoiSchema } from '../src/util/joi';
import type { AgentBootstrapConfigInterface } from '../src/app/agent/agent.bootstrap.schema.gen';

const agentAppConfigSchema = getAppConfigSchemaObject(AgentConfigSchema, { port: AgentListenerDefaultPort });

enum MainCommand {
  bootstrap = 'bootstrap',
  serve = 'serve',
}

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

  const allArgs = Joi.attempt(
    values,
    AgentBootstrapConfigSchema.append(joiParseArgsLogOptions),
    'Error evaluating command args:',
  );
  const logArgs = joiKeepOnlyKeysInJoiSchema<NewLoggerArgs>(allArgs, joiParseArgsLogOptionsSchema);
  const logger = newLoggerFromParseArgs(logArgs);
  setupUncaughtHandler(logger);

  const boostrapConfig = joiKeepOnlyKeysInJoiSchema<AgentBootstrapConfigInterface>(allArgs, AgentBootstrapConfigSchema);
  const configPath = await agentBootstrapConfig({ logger }, boostrapConfig);

  const config = await loadConfig<AppConfigSchemaInterface<AgentConfigInterface>>(configPath, agentAppConfigSchema);
  const agent = new Agent(logger, config.app);

  const reloadResult = await agent.reloadRelease(true);
  logger.info(`Processed first release`, { result: reloadResult });

  /*
   * TODO
   * TODO
   * TODO
   * TODO configure the cron on the release side?
   * TODO
   * TODO
   */

  /*
   * Spawn the agent and detach
   * spawnDetached(process.execPath, [MainCommand.serve, `--${parseArgsConfigOptionsConfigPathKey}`, configPath]);
   */
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

  const { configPath, ...otherArgs } = Joi.attempt(values, parseArgsAppBaseJoiObject, 'Error evaluating command args:');
  const logger = newLoggerFromParseArgs(otherArgs);
  setupUncaughtHandler(logger);

  const config = await loadConfig<AppConfigSchemaInterface<AgentConfigInterface>>(configPath, agentAppConfigSchema);
  const agent = new Agent(logger, config.app);

  const app = newServer({ logger }, {});

  agent.mountRoutes(app);

  const server = app.listen(config.listener.port, config.listener.addr ?? localhost127, () => {
    logger.info(`Server listening`, {
      address: server.address(),
      config,
    });
  });
}

void main();
