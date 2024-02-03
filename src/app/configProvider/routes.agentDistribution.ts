/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { IRouter } from 'express';
import type { AbstractAssetsDistributionInstance } from '../../assetsDistribution/abstractAssetsDistribution';
import { AbstractAssetsDistribution } from '../../assetsDistribution/abstractAssetsDistribution';
import type { ContextLogger } from '../../util/context';

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
import { joiAttemptRequired } from '../../util/joi';
import { isPartOfESBuildBundle } from '../../util/build';
import { defaultCacheDir } from '../../util/constants';
import { mkdirp } from 'mkdirp';
import module from 'node:module';
import type { fnSignatureCreateNodeJSBundle } from '../../commands/createNodeJSBundle.schema';
import { fsPromiseExists } from '../../util/fs';
import { getNewDefaultRouter } from '../../util/expressRoutes';

const RouterAgentDistributionPrefix = '/agentDistribution';
const RoutesAgentDistributionDownloadRoutePrefix = '/download';

export interface RoutesAgentDistributionArgs {
  assetDistributionInstance: AbstractAssetsDistributionInstance;
  appExternalUrl: string;
  routerParentPath: string;
}

const requireOnDemand = module.createRequire(__filename);
const agentDistributionDevCache: Record<string, string> = {};
// NodePlatform-NodeArch => path
const agentDistributionCacheDir = path.join(defaultCacheDir, '.agentDistribution');

export function mountRoutesAgentDistribution(
  context: ContextLogger,
  app: IRouter,
  { assetDistributionInstance, appExternalUrl, routerParentPath }: RoutesAgentDistributionArgs
) {
  const router = getNewDefaultRouter();

  const nj = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(path.join(__dirname, 'viewsAgentDistribution'), { watch: true }),
    { autoescape: true }
  );
  nunjucksApplyCustomFunctions(nj);

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.get('/install.sh', async (req, res) => {
    const reqData = joiAttemptRequired(
      req.query,
      AgentDistributionInstallShRequestSchema
    ) as AgentDistributionInstallShRequestInterface;

    const externalUrl = reqData.externalUrl ?? appExternalUrl;

    const renderContext = {
      configProviderUrl: externalUrl,
      downloadUrl: `${externalUrl}${routerParentPath}${RouterAgentDistributionPrefix}${RoutesAgentDistributionDownloadRoutePrefix}`,
    };
    res.header('Content-Type', 'text/plain');
    res.send(nj.render('install.sh', renderContext));
  });

  AbstractAssetsDistribution.mountStaticRoutes(context, router, assetDistributionInstance);
  assetDistributionInstance.mountRoutes(context, router);

  // This route is to help download the agent, by masking the version number.
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.get(`${RoutesAgentDistributionDownloadRoutePrefix}/:nodePlatform/:nodeArch`, async (req, res) => {
    const reqData = joiAttemptRequired(
      req.params,
      AgentDistributionGetDownloadRequestSchema
    ) as AgentDistributionGetDownloadRequestInterface;

    if (!isPartOfESBuildBundle) {
      /*
       * This is a pure case for development, where we don't have pre-made packages.
       * Make the package the first time!
       */
      const cacheKey = `agent-dev-${reqData.nodePlatform}-${reqData.nodeArch}${
        reqData.nodePlatform == 'win' ? '.exe' : ''
      }`;
      if (agentDistributionDevCache[cacheKey] != null) {
        if (!(await fsPromiseExists(agentDistributionDevCache[cacheKey]))) {
          delete agentDistributionDevCache[cacheKey];
        }
      }
      if (agentDistributionDevCache[cacheKey] == null) {
        const { createNodeJSBundle } = requireOnDemand('../../commands/createNodeJSBundle') as {
          createNodeJSBundle: fnSignatureCreateNodeJSBundle;
        };
        await mkdirp(agentDistributionCacheDir);
        const bundlePath = await createNodeJSBundle(context, {
          nodePlatform: reqData.nodePlatform as NodeJSExecutablePlatform,
          nodeArch: reqData.nodeArch as NodeJSExecutableArch,
          outDir: agentDistributionCacheDir,
          bundleFileName: cacheKey,
          entryPoint: path.join(__dirname, '..', '..', '..', 'cmd', 'agent.ts'),
        });
        agentDistributionDevCache[cacheKey] = bundlePath;
      }
      res.download(agentDistributionDevCache[cacheKey], cacheKey);
      return;
    }

    const queryParams: AbstractAssetsDistributionGetDownloadUrlRequestInterface = {
      assetFile: await getNodeJSBundleFileName(
        context,
        'agent',
        reqData.nodePlatform as NodeJSExecutablePlatform,
        reqData.nodeArch as NodeJSExecutableArch
      ),
      redirect: true,
    };

    res.redirect(
      // Redirects to the assets distribution instance endpoint
      url.format({
        pathname: `../..${AbstractAssetsDistributionGetDownloadUrlRoutePath}`,
        query: queryParams as unknown as ParsedUrlQueryInput,
      })
    );
  });

  app.use(RouterAgentDistributionPrefix, router);
}
