/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { IRouter } from 'express';
import type { AbstractAssetsDistributionInstance } from '../../assetsDistribution/abstractAssetsDistribution';
import { AbstractAssetsDistribution } from '../../assetsDistribution/abstractAssetsDistribution';
import type { ContextLogger } from '../../util/context';

import {
  AgentDistributionGetDownloadRequestSchema,
  AgentDistributionInstallShRequestSchema,
} from './kiwiProvider.schema';
import type {
  AgentDistributionGetDownloadRequestInterface,
  AgentDistributionInstallShRequestInterface,
} from './kiwiProvider.schema.gen';
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
import type { CommandCreateNodeJSBundleFormat } from '../../commands/createNodeJSBundle.schema';
import { getNewDefaultRouter } from '../../util/expressRoutes';
import { promisify } from 'node:util';
import { envIsProduction } from '../../util/env';
import { areWeTestingWithJest } from '../../util/constants';

const RouterAgentDistributionPrefix = '/agentDistribution';
const RoutesAgentDistributionDownloadRoutePrefix = '/download';

export interface RoutesAgentDistributionArgs {
  assetDistributionInstance: AbstractAssetsDistributionInstance;
  appExternalUrl: string;
  routerParentPath: string;
}

// const requireOnDemand = module.createRequire(__filename);
// const agentDistributionDevCache: Record<string, string> = {};
// // NodePlatform-NodeArch => path
// const agentDistributionCacheDir = path.join(defaultCacheDir, '.agentDistribution');

export function mountRoutesAgentDistribution(
  context: ContextLogger,
  app: IRouter,
  { assetDistributionInstance, appExternalUrl, routerParentPath }: RoutesAgentDistributionArgs
) {
  const router = getNewDefaultRouter();

  const nj = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(path.join(__dirname, 'viewsAgentDistribution'), {
      watch: !(envIsProduction || areWeTestingWithJest()),
    }),
    { autoescape: false }
  );
  nunjucksApplyCustomFunctions(nj);
  const njRender = promisify(nj.render.bind(nj)) as (name: string, context?: object) => Promise<string>;

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.get('/install.sh', async (req, res) => {
    const reqData = joiAttemptRequired(
      req.query,
      AgentDistributionInstallShRequestSchema
    ) as AgentDistributionInstallShRequestInterface;

    const externalUrl = reqData.externalUrl ?? appExternalUrl;

    const renderContext = {
      kiwiProviderUrl: externalUrl,
      downloadUrl: `${externalUrl}${routerParentPath}${RouterAgentDistributionPrefix}${RoutesAgentDistributionDownloadRoutePrefix}`,
    };
    res.header('Content-Type', 'text/plain');
    context.logger.debug('Sending agent installer', {
      reqData,
    });
    res.send(await njRender('install.gen.sh', renderContext));
  });

  AbstractAssetsDistribution.mountStaticRoutes(context, router, assetDistributionInstance);
  assetDistributionInstance.mountRoutes(context, router);

  // This route is to help download the kiwiAgent, by masking the version number.
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.get(`${RoutesAgentDistributionDownloadRoutePrefix}/:nodePlatform/:nodeArch/:format`, async (req, res) => {
    const reqData = joiAttemptRequired(
      req.params,
      AgentDistributionGetDownloadRequestSchema
    ) as AgentDistributionGetDownloadRequestInterface;

    // const buildVersionArgs: GetBuildVersionArgs | undefined = !isPartOfESBuildBundle
    //   ? {
    //       method: BuildVersionMethod.arg,
    //       versionArg: 'dev',
    //     }
    //   : undefined;
    //
    // const assetFile = await getNodeJSBundleFileName(
    //   context,
    //   'kiwiAgent',
    //   reqData.nodePlatform as NodeJSExecutablePlatform,
    //   reqData.nodeArch as NodeJSExecutableArch,
    //   reqData.format as CommandCreateNodeJSBundleFormat,
    //   buildVersionArgs
    // );

    // if (!isPartOfESBuildBundle) {
    //   /*
    //    * This is a pure case for development, where we don't have pre-made packages.
    //    * Make the package the first time!
    //    */
    //   if (agentDistributionDevCache[assetFile] != null) {
    //     if (!(await fsPromiseExists(agentDistributionDevCache[assetFile]))) {
    //       delete agentDistributionDevCache[assetFile];
    //     }
    //   }
    //   if (agentDistributionDevCache[assetFile] == null) {
    //     const { createNodeJSBundle } = requireOnDemand('../../commands/createNodeJSBundle') as {
    //       createNodeJSBundle: fnSignatureCreateNodeJSBundle;
    //     };
    //     await mkdirp(agentDistributionCacheDir);
    //     const bundlePath = await createNodeJSBundle(context, {
    //       nodePlatform: reqData.nodePlatform as NodeJSExecutablePlatform,
    //       nodeArch: reqData.nodeArch as NodeJSExecutableArch,
    //       outDir: agentDistributionCacheDir,
    //       bundleFileName: assetFile,
    //       entryPoint: path.join(__dirname, '..', '..', '..', 'cmd', 'kiwiAgent.ts'),
    //       format: reqData.format as CommandCreateNodeJSBundleFormat,
    //     });
    //     agentDistributionDevCache[assetFile] = bundlePath;
    //   }
    //   res.download(agentDistributionDevCache[assetFile], assetFile);
    //   return;
    // }

    const queryParams: AbstractAssetsDistributionGetDownloadUrlRequestInterface = {
      assetFile: await getNodeJSBundleFileName(
        context,
        'kiwiAgent',
        reqData.nodePlatform as NodeJSExecutablePlatform,
        reqData.nodeArch as NodeJSExecutableArch,
        reqData.format as CommandCreateNodeJSBundleFormat
      ),
      redirect: true,
    };

    res.redirect(
      // Redirects to the assets distribution instance endpoint
      url.format({
        // 3 steps plat/arch/format
        pathname: `../../..${AbstractAssetsDistributionGetDownloadUrlRoutePath}`,
        query: queryParams as unknown as ParsedUrlQueryInput,
      })
    );
  });

  app.use(RouterAgentDistributionPrefix, router);
}
