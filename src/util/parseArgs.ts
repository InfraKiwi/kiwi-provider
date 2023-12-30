/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { joiParseArgsLogOptions, parseArgsLogOptions } from './logger';
import { joiAttemptRequired, joiValidateSyncFSExists } from './joi';

import { loadYAMLFromFile } from './yaml';

export const parseArgsConfigOptionsConfigPathKey = 'configPath';

export const parseArgsConfigOptions: ParseArgsOptionsConfig = {
  // Config file path
  [parseArgsConfigOptionsConfigPathKey]: {
    type: 'string',
    short: 'c',
  },
};

export async function loadConfig<T>(configPath: string | undefined, schema: Joi.Schema): Promise<T> {
  const configObject = (configPath ? await loadYAMLFromFile(configPath) : {}) ?? {};
  return joiAttemptRequired(configObject, schema);
}

export const parseArgsAppBaseOptions: ParseArgsOptionsConfig = {
  ...parseArgsLogOptions,
  ...parseArgsConfigOptions,
};

export const parseArgsAppBaseJoiObject = Joi.object()
  .append(joiParseArgsLogOptions)
  .append({
    [parseArgsConfigOptionsConfigPathKey]: Joi.string().custom(joiValidateSyncFSExists),
  });
