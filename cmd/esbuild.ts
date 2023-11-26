import * as path from 'node:path';
import type { OnLoadArgs, PluginBuild } from 'esbuild';
import { build } from 'esbuild';
import '../src/util/loadAllRegistryEntries.gen';
import { fsPromiseReadFile } from '../src/util/fs';

const nodeModules = new RegExp(/^(?:.*[\\/])?node_modules$/);

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

const versionTag = '[VI]{{inject}}[/VI]';

const injectorPlugin = {
  name: 'dirname',

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
      {
        const dirname = path.dirname(args.path).replaceAll(path.sep, '/');
        contents = contents
          .replace('__dirname', `"${dirname}"`)
          .replace('__filename', `"${args.path.replaceAll(path.sep, '/')}"`);
      }

      // version
      if (contents.includes(versionTag)) {
        const version = new Date().toISOString();
        contents = contents.replaceAll(versionTag, version);
      }

      return {
        contents,
        loader: getESBuildLoader(args),
      };
    });
  },
};

void build({
  entryPoints: ['cmd/serverWorker.ts'],
  bundle: true,
  minifyWhitespace: true,
  minifySyntax: true,
  keepNames: true,
  sourcemap: false,
  outfile: 'dist/bundle.cjs',
  platform: 'node',
  format: 'cjs',
  // Manually exclude https://github.com/evanw/esbuild/issues/3434 because yeah
  external: ['dtrace-provider'],
  plugins: [injectorPlugin],
});
