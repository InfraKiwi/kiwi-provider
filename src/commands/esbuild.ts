/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { OnLoadArgs, Plugin, PluginBuild } from 'esbuild';
import * as esbuild from 'esbuild';
import path from 'node:path';
import { fsPromiseReadFile } from '../util/fs';
import { isPartOfESBuildBundleValue, versionKiwiProvider, versionESBuild } from '../util/build';
import { getBuildVersion } from '../util/package';
import type { ContextLogger } from '../util/context';

const nodeModules = new RegExp(/^(?:.*[\\/])?node_modules$/);

/**
 *
 * This cmd can be used to bundle whichever entrypoint to a single cjs file.
 *
 * NOTE: we cannot bundle esbuild itself, so for other cases we use src/util/esbuild.ts
 *
 */

function getESBuildLoader(args: OnLoadArgs) {
  const resolvedExtName = path.extname(args.path);
  switch (resolvedExtName) {
    case '.ts':
    case '.mts':
    case '.cts':
      return 'ts';
    case '.jsx':
    case '.tsx':
      return 'tsx';
    case '.json':
      return 'json';
    case '.css':
    case '.scss':
    case '.sass':
    case '.less':
    case '.styl':
      return 'css';
    case '.txt':
      return 'text';
    case '.js':
    case '.cjs':
    case '.mjs':
    default:
      return 'js';
  }
}

const rootPath = path.join(__dirname, '..', '..');

export interface InjectorPluginArgs {
  version?: string;
}

function getInjectorPlugin(pluginArgs: InjectorPluginArgs): Plugin {
  return {
    name: 'InjectorPlugin',
    setup(build: PluginBuild) {
      build.onLoad({ filter: /.*/ }, async (args) => {
        if (args.path.match(nodeModules)) {
          return undefined;
        }
        const ext = path.extname(args.path).substring(1);
        if (ext != 'ts') {
          return undefined;
        }
        let contents = await fsPromiseReadFile(args.path, 'utf8');

        // __dirname/__filename
        if (contents.includes('__dirname') || contents.includes('__filename')) {
          const relPath = '/' + path.relative(rootPath, args.path).replaceAll(path.sep, '/');
          const dirname = path.dirname(relPath);
          const filename = relPath;
          contents = contents.replaceAll('__dirname', `"${dirname}"`).replaceAll('__filename', `"${filename}"`);
        }

        // version
        if (contents.includes(versionKiwiProvider)) {
          const version = pluginArgs.version ?? new Date().toISOString();
          contents = contents.replaceAll(versionKiwiProvider, version);
        }
        if (contents.includes(versionESBuild)) {
          const version = esbuild.version;
          contents = contents.replaceAll(versionESBuild, version);
        }
        if (contents.includes(isPartOfESBuildBundleValue)) {
          contents = contents.replaceAll(isPartOfESBuildBundleValue, 'true');
        }

        return {
          contents,
          loader: getESBuildLoader(args),
        };
      });
    },
  };
}

export async function runESBuild(context: ContextLogger, entryPoint: string, outFile: string) {
  context.logger.debug(`Running esBuild`, {
    entryPoint,
    outFile,
  });
  await esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    keepNames: true,
    sourcemap: false,
    outfile: outFile,
    platform: 'node',
    format: 'cjs',
    // Manually exclude https://github.com/evanw/esbuild/issues/3434 because yeah
    external: ['dtrace-provider'],
    plugins: [getInjectorPlugin({ version: await getBuildVersion(context) })],
  });
}
