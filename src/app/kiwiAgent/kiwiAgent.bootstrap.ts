/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { ContextLogger } from '../../util/context';
import type { AgentBootstrapConfigInterface } from './kiwiAgent.bootstrap.schema.gen';
import { AgentBootstrapConfigSchema } from './kiwiAgent.bootstrap.schema';
import path from 'node:path';
import { fsPromiseExists, fsPromiseWriteFile } from '../../util/fs';
import type { AgentConfigInterface } from './kiwiAgent.schema.gen';
import type { AppConfigSchemaInterface } from '../common/server';
import { AgentListenerDefaultPort } from './kiwiAgent.schema';

import { dumpYAML } from '../../util/yaml';
import { joiAttemptRequired } from '../../util/joi';

export async function agentBootstrapConfig(
  { logger }: ContextLogger,
  config: AgentBootstrapConfigInterface
): Promise<string> {
  config = joiAttemptRequired(config, AgentBootstrapConfigSchema, 'Failed to parse kiwiAgent bootstrap config');

  logger.info('Bootstrapping kiwi kiwiAgent', config);

  const configFile = path.join(config.installDir, 'config.yaml');
  if (await fsPromiseExists(configFile)) {
    if (config.force != true) {
      throw new Error(
        `kiwi agent configuration already exists at ${configFile}. If you want to overwrite it, please use the --force flag.`
      );
    }

    logger.warn(`Overwriting existing kiwi-agent configuration at ${configFile}`);
  } else {
    logger.info(`Generating new kiwi-agent configuration at ${configFile}`);
  }

  const databasePath = path.join(config.installDir, 'release.db.txt');
  const agentConfig: AppConfigSchemaInterface<AgentConfigInterface> = {
    listener: { port: AgentListenerDefaultPort },
    app: {
      kiwiProviderUrl: config.url,
      databasePath,
    },
  };

  await fsPromiseWriteFile(configFile, dumpYAML(agentConfig));

  return configFile;
}
