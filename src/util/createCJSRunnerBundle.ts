import type { ContextLogger } from './context';
import { mkdirp } from 'mkdirp';
import path from 'node:path';
import { fsPromiseExists } from './fs';
import { defaultCacheDir } from './constants';
import { isPartOfESBuildBundle } from './build';
import module from 'node:module';

const requireOnDemand = module.createRequire(__filename);
const cjsRunnerBundleCacheDirDefault = path.join(defaultCacheDir, '.cjsRunnerBundle');

// We use the current time as cache key, so the cache is valid only for this current run
const cacheKey = new Date().getTime();

export interface CreateCJSRunnerBundleArgs {
  cacheDir?: string;
  entryPoint: string;
}

export async function createCJSRunnerBundle(context: ContextLogger, args: CreateCJSRunnerBundleArgs): Promise<string> {
  if (isPartOfESBuildBundle) {
    /*
     * TODO
     * TODO
     * TODO download a prebuilt CJS
     * TODO download a prebuilt CJS
     * TODO download a prebuilt CJS
     * TODO download a prebuilt CJS
     * TODO
     * TODO
     */
    throw new Error(`Not yet implemented`);
  }

  /*
   * This is made in this way so that we don't actually import the ESBuild package when building the CJS
   * bundle, but only if we're developing locally
   */
  const { runESBuild } = requireOnDemand('../commands/esbuild');

  const cacheDir = args.cacheDir ?? cjsRunnerBundleCacheDirDefault;
  await mkdirp(cacheDir);
  const fileName = `bundle-${path.basename(args.entryPoint, path.extname(args.entryPoint))}-${cacheKey}.cjs`;
  const cachedBundle = path.join(cacheDir, fileName);

  if (await fsPromiseExists(cachedBundle)) {
    return cachedBundle;
  }

  context.logger.info(`Preparing CJS bundle`);
  await runESBuild(args.entryPoint, cachedBundle);

  return cachedBundle;
}
