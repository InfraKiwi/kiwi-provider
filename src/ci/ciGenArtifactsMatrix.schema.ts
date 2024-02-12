/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';
import { getJoiEnumKeys, joiMetaClassName, joiObjectWithPattern } from '../util/joi';
import { NodeJSExecutableArch, NodeJSExecutablePlatform } from '../util/downloadNodeDist';
import { CommandCreateNodeJSBundleFormat } from '../commands/createNodeJSBundle.schema';

/*
 * kiwi-cli:
 *  entrypoint: cmd/kiwiCLI.ts
 *  variants:
 *  - platform: linux
 *    arch:
 *      - arm
 *      - arm64
 *      - x64
 */
export const CmdCIGenArtifactsMatrixConfigSchema = Joi.object({
  packages: joiObjectWithPattern(
    Joi.object({
      entryPoint: Joi.string().required(),
      variants: Joi.array()
        .items(
          Joi.object({
            platform: getJoiEnumKeys(NodeJSExecutablePlatform).required(),
            formats: Joi.array().items(getJoiEnumKeys(CommandCreateNodeJSBundleFormat)),
            arch: Joi.array().items(getJoiEnumKeys(NodeJSExecutableArch)).required(),
          }).required()
        )
        .min(1)
        .required(),
    })
  ).required(),
}).meta(joiMetaClassName('CmdCIGenArtifactsMatrixConfigInterface'));
