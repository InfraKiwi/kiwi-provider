/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { IRouter } from 'express';
import express from 'express';
import type { AbstractAssetsDistributionInstance } from '../../assetsDistribution/abstractAssetsDistribution';
import { AbstractAssetsDistribution } from '../../assetsDistribution/abstractAssetsDistribution';
import type { ContextLogger } from '../../util/context';
import Joi from 'joi';

import {
  AgentDistributionGetDownloadRequestSchema,
  AgentDistributionInstallShRequestSchema,
} from './configProvider.schema';
import type {
  AgentDistributionGetDownloadRequestInterface,
  AgentDistributionInstallShRequestInterface,
} from './configProvider.schema.gen';
import * as url from 'node:url';
import { AbstractAssetsDistributionGetDownloadUrlRoutePath } from '../../assetsDistribution/abstractAssetsDistribution.schema';
import type { AbstractAssetsDistributionGetDownloadUrlRequestInterface } from '../../assetsDistribution/abstractAssetsDistribution.schema.gen';
import { getNodeJSBundleFileName } from '../../commands/createNodeJSBundle.helpers';
import type { NodeJSExecutableArch, NodeJSExecutablePlatform } from '../../util/downloadNodeDist';
import type { ParsedUrlQueryInput } from 'node:querystring';
import path from 'node:path';
import nunjucks from 'nunjucks';
import { nunjucksApplyCustomFunctions } from '../../util/tpl';

const RouterAgentDistributionPrefix = '/agentDistribution';
const RoutesAgentDistributionDownloadRoutePrefix = '/download';

export interface RoutesAgentDistributionArgs {
  assetDistributionInstance: AbstractAssetsDistributionInstance;
  appExternalUrl: string;
  routerParentPath: string;
}

export function mountRoutesAgentDistribution(
  context: ContextLogger,
  app: IRouter,
  { assetDistributionInstance, appExternalUrl, routerParentPath }: RoutesAgentDistributionArgs
) {
  const router = express.Router();

  const nj = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(path.join(__dirname, 'viewsAgentDistribution'), { watch: true }),
    { autoescape: true }
  );
  nunjucksApplyCustomFunctions(nj);

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.get('/install.sh', async (req, res) => {
    const reqData = Joi.attempt(
      req.query,
      AgentDistributionInstallShRequestSchema
    ) as AgentDistributionInstallShRequestInterface;

    const externalUrl = reqData.externalUrl ?? appExternalUrl;

    const renderContext = {
      configProviderUrl: externalUrl,
      downloadUrl: `${externalUrl}${routerParentPath}${RouterAgentDistributionPrefix}${RoutesAgentDistributionDownloadRoutePrefix}`,
    };
    res.send(nj.render('install.sh', renderContext));
  });

  AbstractAssetsDistribution.mountStaticRoutes(context, router, assetDistributionInstance);
  assetDistributionInstance.mountRoutes(context, router);

  // This route is to help download the agent, by masking the version number.
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.get(`${RoutesAgentDistributionDownloadRoutePrefix}/:nodePlatform/:nodeArch`, async (req, res) => {
    const reqData = Joi.attempt(
      req.params,
      AgentDistributionGetDownloadRequestSchema
    ) as AgentDistributionGetDownloadRequestInterface;

    const queryParams: AbstractAssetsDistributionGetDownloadUrlRequestInterface = {
      assetFile: await getNodeJSBundleFileName(
        'agent',
        reqData.nodePlatform as NodeJSExecutablePlatform,
        reqData.nodeArch as NodeJSExecutableArch
      ),
      plain: true,
    };

    res.redirect(
      url.format({
        pathname: `../..${AbstractAssetsDistributionGetDownloadUrlRoutePath}`,
        query: queryParams as unknown as ParsedUrlQueryInput,
      })
    );
  });

  app.use(RouterAgentDistributionPrefix, router);
}
