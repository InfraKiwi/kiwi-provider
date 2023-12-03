import type { ContextLogger } from '../../util/context';
import type { AgentBootstrapConfigInterface } from './agent.bootstrap.schema.gen';
import Joi from 'joi';
import { AgentBootstrapConfigSchema } from './agent.bootstrap.schema';
import path from 'node:path';
import { fsPromiseExists, fsPromiseWriteFile } from '../../util/fs';
import type { AgentConfigInterface } from './agent.schema.gen';
import type { AppConfigSchemaInterface } from '../common/server';
import { AgentListenerDefaultPort } from './agent.schema';

import { dumpYAML } from '../../util/yaml';

export async function agentBootstrapConfig(
  { logger }: ContextLogger,
  config: AgentBootstrapConfigInterface,
): Promise<string> {
  config = Joi.attempt(config, AgentBootstrapConfigSchema, 'Failed to parse agent bootstrap config');

  logger.info(`Bootstrapping 10infra agent`, config);

  const configPath = path.join(config.installDir, 'config.yaml');
  if (await fsPromiseExists(configPath)) {
    if (config.force != true) {
      throw new Error(
        `10infra agent configuration already exists at ${configPath}. If you want to overwrite it, please use the --force flag.`,
      );
    }

    logger.warning(`Overwriting existing 10infra agent configuration at ${configPath}`);
  } else {
    logger.info(`Generating new 10infra agent configuration at ${configPath}`);
  }

  const databasePath = path.join(config.installDir, 'release.db.txt');
  const agentConfig: AppConfigSchemaInterface<AgentConfigInterface> = {
    listener: { port: AgentListenerDefaultPort },
    app: {
      configProviderUrl: config.url,
      databasePath,
    },
  };

  await fsPromiseWriteFile(configPath, dumpYAML(agentConfig));

  return configPath;
}
