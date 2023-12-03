import { glob, globSync } from 'glob';
import path from 'node:path';
import { convertFromDirectory } from 'joi-to-typescript';
import * as fs from 'node:fs';
import type { JoiMetaExternalImport } from '../src/util/joi';
import { joiMetaExternalImportKey } from '../src/util/joi';
import { fsPromiseExists, fsPromiseReadDir, fsPromiseReadFile, fsPromiseRm, fsPromiseWriteFile } from '../src/util/fs';
import { asyncFilter } from '../src/util/async';
import { registryGetClassNameFromJoiSchema, registryGetEntryNamesFromJoiSchema } from '../src/util/registry';
import { ESLint } from 'eslint';
import type Joi from 'joi';
import { newDebug } from '../src/util/debug';
import * as prettier from 'prettier';
import { indentString } from '../src/util/indent';
import {
  getRegistryEntriesSchemaBaseName,
  getTypeRefString,
  registryExportsSchemaFileName,
} from '../src/util/schemaGenUtils';

const debug = newDebug(__filename);

const generatedHeader = '// Generated with: yarn gen -> cmd/schemaGen.ts';

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.resolve(rootDir, 'src');
const docsNavBasePath = path.join(rootDir, 'hack', 'docs');

// const prismaPathGlob = path.resolve(rootDir, 'prisma', 'generated', 'schemas/**/*schema.ts').replaceAll(path.sep, '/');
// debug(`Looking for Prisma schemas in ${prismaPathGlob}`);
// const prismaGlobList = Array.from(globSync(prismaPathGlob));

const schemaFileCache: Record<string, string> = {};

async function findSchemaExports(schemaFile: string) {
  const imported = await import(schemaFile);
  const contents =
    schemaFile in schemaFileCache
      ? schemaFileCache[schemaFile]
      : await (async () => {
          const c = await fsPromiseReadFile(schemaFile, 'utf-8');
          schemaFileCache[schemaFile] = c;
          return c;
        })();

  const schemaExports: Record<
    string,
    {
      schema: Joi.Schema;
      exportedKey: string;
      entryNames: string[];
    }
  > = {};

  const returnValue = {
    imported,
    schemaExports,
  };

  /*
   * Find all registry entries
   * export const DataSourceFileRawSchema = dataSourceRegistryEntryFactory.createJoiEntrySchema(
   */
  const createJoiEntrySchemaCalls = contents.match(
    /^export const (\w+) = (\w+)(?:[\n\r ]*)?\.createJoiEntrySchema\(/gm,
  );
  if (createJoiEntrySchemaCalls) {
    for (const line of new Set(createJoiEntrySchemaCalls)) {
      const matches = line.match(/^export const (\w+) = (\w+)(?:[\n\r ]*)?\.createJoiEntrySchema\(/m)!;
      const [, exportedKey] = matches;
      const schema = imported[exportedKey];
      if (schema == null) {
        throw new Error(`Exported schema ${exportedKey} not found`);
      }
      const className = registryGetClassNameFromJoiSchema(schema);
      if (className == null) {
        throw new Error(`className is null for schema ${schema}`);
      }
      const entryNames = registryGetEntryNamesFromJoiSchema(schema);
      if (entryNames == null || entryNames.length == 0) {
        throw new Error(`entryNames is null for schema ${schema}`);
      }
      if (entryNames) {
        schemaExports[className] = {
          schema,
          entryNames,
          exportedKey,
        };
      }
    }
  }

  return returnValue;
}

/*
 * Generate loadAll files for all registries
 * Generate docs indexes for all registries
 * Generate registry exports for all registries
 */
async function genRegistriesEntries() {
  // Scan for all folders containing a registry.ts file containing a `new RegistryEntryFactory` entry
  const pathGlob = path.resolve(srcDir, '**/registry.ts').replaceAll(path.sep, '/');
  const globRaw = await asyncFilter(
    await glob(pathGlob),
    async (p) => await fileContains(p, `new RegistryEntryFactory(`, `new Registry(`),
  );
  const globList = Array.from(new Set(globRaw.map((el) => el.substring(0, el.lastIndexOf(path.sep) + 1))));

  const importGroups: Record<string, ImportGroup> = {
    '.loadAllConfigProvider': {
      genFileSuffix: '.configProvider',
      excludeFromAll: true,
    },
    '.loadAllTestSuite': {
      genFileSuffix: '.testSuite',
      excludeFromAll: true,
    },
  };

  const loadAllGroups: Record<string, string[]> = { all: [] };

  for (const folder of globList) {
    // Remove any  gen files first
    for (const file of await glob(`${folder}/*.gen.ts`)) {
      await fsPromiseRm(file);
    }

    const subFolders = await fsPromiseReadDir(folder, { withFileTypes: true });

    const subFoldersWithoutHidden = subFolders.filter((p) => p.isDirectory() && !p.name.startsWith('_'));
    const imports = subFoldersWithoutHidden.map((p) => `import './${p.name}';`);

    let excludeFromAll = false;
    for (const checkFile in importGroups) {
      const importGroup = importGroups[checkFile];
      if (!(await fsPromiseExists(path.join(folder, checkFile)))) {
        continue;
      }
      if (importGroup.excludeFromAll) {
        excludeFromAll = true;
      }

      const loadAllFile = path.join(folder, `loadAll${importGroup.genFileSuffix}.gen.ts`);
      await fsPromiseWriteFile(loadAllFile, generatedHeader + '\n\n' + imports.join('\n'));
      loadAllGroups[checkFile] ??= [];
      loadAllGroups[checkFile].push(loadAllFile.replace(/\.ts$/, ''));
    }

    if (!excludeFromAll) {
      const loadAllFile = path.join(folder, 'loadAll.gen.ts');
      await fsPromiseWriteFile(loadAllFile, generatedHeader + '\n\n' + imports.join('\n'));
      loadAllGroups.all.push(loadAllFile.replace(/\.ts$/, ''));
    }

    // Generate docs navs
    await generateDocsNav(
      folder,
      subFoldersWithoutHidden.map((p) => p.name),
    );

    const exportedSchemas: Record<
      // module key
      string,
      {
        importPath: string;
        schemaExport: string;
      }
    > = {};

    for (const subFolder of subFoldersWithoutHidden.map((p) => p.name)) {
      const schemaFile = path.join(folder, subFolder, 'schema.ts');
      const { schemaExports } = await findSchemaExports(schemaFile);
      for (const className of Object.keys(schemaExports)) {
        const { entryNames, exportedKey } = schemaExports[className];
        for (const entryName of entryNames) {
          exportedSchemas[entryName] = {
            importPath: `./${subFolder}/schema`,
            schemaExport: exportedKey,
          };
        }
      }
    }

    {
      const fileName = path.join(folder, registryExportsSchemaFileName);
      const entries = exportedSchemas;
      const contents = `
import Joi from 'joi';
${Object.keys(entries)
  .reduce((acc: string[], el) => {
    acc.push(`import { ${entries[el].schemaExport} } from '${entries[el].importPath}';`);
    return acc;
  }, [])
  .join('\n')}

export const ${getRegistryEntriesSchemaBaseName(folder)}Schema = Joi.object({
${Object.keys(entries)
  .reduce((acc: string[], el) => {
    acc.push(`  ${el}: ${entries[el].schemaExport},`);
    return acc;
  }, [])
  .join('\n')}
}).meta({ className: '${getRegistryEntriesSchemaBaseName(folder)}Interface' });
`;

      // NOTE: flush is not supported until node 21
      await fsPromiseWriteFile(fileName, contents, { flush: true });
    }
  }

  for (const key in loadAllGroups) {
    const fileSuffix = key in importGroups ? importGroups[key].genFileSuffix : '';
    // Load all central files
    const loadAllCentralFile = path.resolve(
      __dirname,
      '..',
      'src',
      'util',
      `loadAllRegistryEntries${fileSuffix}.gen.ts`,
    );
    const loadAllCentralImports = loadAllGroups[key]
      .map((p) => path.relative(path.dirname(loadAllCentralFile), p).replaceAll(path.sep, '/'))
      .map((p) => `import '${p}';`);
    await fsPromiseWriteFile(loadAllCentralFile, generatedHeader + '\n\n' + loadAllCentralImports.join('\n'));
  }
}

const genSchemaFolders = async () => {
  // Scan for all object types that can generate a schema
  const pathGlob = path.resolve(srcDir, '**/*schema.ts').replaceAll(path.sep, '/');
  debug(`Looking for schemas in ${pathGlob}`);
  const globRaw = await glob(pathGlob);
  const globList = Array.from(new Set(globRaw.map((el) => el.substring(0, el.lastIndexOf(path.sep) + 1))));
  debug(`GlobList`, {
    globRaw,
    globList,
  });

  for (const p of globList) {
    await genSchemaFolder(p);
  }

  /*
   * Fix the rest
   * const pL = pLimit(1);
   * await Promise.all(globList.map((l) => pL(() => genSchemaFolder(l))));
   */
};

// https://regex101.com/r/2eJ7A2/1
const newIntfRegex = () =>
  /((?:^\s+(?:\/\*\*|\*(?: [^\n]+)?|\*\/)$\n)+)?^(?: *)(?:\||.+?[:=]).* (\w+Interface)\b(.*)$/gm;

async function fixGenImports() {
  const files = globSync(path.resolve(srcDir, '**/*schema.gen.ts').replaceAll(path.sep, '/'));

  debug('All files to be inspected', files);

  const fileCache: Record<string, string> = {};
  const fileCacheOriginal: Record<string, string> = {};
  for (const file of files) {
    const contents = fs.readFileSync(file, 'utf-8');
    fileCache[file] = contents;
    fileCacheOriginal[file] = contents;
  }

  /*
   * Extract all exports
   * Intf name / file path
   */
  const interfacesDefinitionsMap: Record<string, string> = {};
  for (const file of files) {
    const contents = fileCache[file];
    const exportedMatches = contents.match(/export (?:interface|type) (\w+Interface) /g);
    if (exportedMatches) {
      for (const exportedMatch of exportedMatches) {
        const match = exportedMatch.match(/export (?:interface|type) (\w+Interface) /);
        const intfName = match![1];
        interfacesDefinitionsMap[intfName] = file;
        debug(`Found interface definition ${intfName} in ${file}`);
      }
    }
  }

  debug('All definitions', interfacesDefinitionsMap);

  // Process all usages
  for (const file of files) {
    const contents = fileCache[file];
    let newContents = contents;

    const imported: string[] = [];
    const importLines = newContents.match(/^import (?:\{([^}]+)}|(\S+)) from/gm);
    if (importLines) {
      for (const line of new Set(importLines)) {
        const matches = line.match(/^import (?:\{([^}]+)}|(\S+)) from/);
        imported.push(...matches![1].split(',').map((s) => s.trim()));
      }
    }
    if (imported.length > 0) {
      debug(`Found imports in ${file}`, { imported });
    }

    // Process TS imports
    {
      const importLinesSet = new Set<string>();
      let intfMatch: RegExpMatchArray | null;
      const re = newIntfRegex();
      while ((intfMatch = re.exec(newContents)) != null) {
        const intfName = intfMatch[2];
        debug(`File ${file} intf match`, { intfName });

        if (
          // Already added to imports in a previous loop
          imported.includes(intfName) ||
          // The file itself includes the interface definition
          interfacesDefinitionsMap[intfName] == file
        ) {
          continue;
        }

        // Resolve the missing import
        const definitionPath = interfacesDefinitionsMap[intfName];
        if (definitionPath == null) {
          throw new Error(`Definition path not found for interface ${intfName} inf ${file}`);
        }

        const relPath = path.relative(path.dirname(file), definitionPath).replaceAll(path.sep, '/');
        const importLine = `import { ${intfName} } from '${(relPath.startsWith('.') ? relPath : './' + relPath).replace(
          /\.ts$/,
          '',
        )}';`;
        importLinesSet.add(importLine);
      }
      if (importLinesSet.size > 0) {
        newContents = Array.from(importLinesSet).join('\n') + `\n` + newContents;
      }
    }

    fileCache[file] = newContents;
  }

  // Then, after the initial fixes, we fix additional elements like instance imports
  for (const file of files) {
    const contents = fileCache[file];
    let newContents = contents;
    const schemaFile = file.replace('.gen.ts', '.ts');
    const { imported, schemaExports } = await findSchemaExports(schemaFile);

    {
      // Find all schemas
      const schemas = Object.fromEntries(
        Object.entries(imported)
          .filter(([k]) => k.endsWith('Schema'))
          .map(([k, v]) => {
            const vCast = v as Joi.Schema;
            return [k, vCast];
          }),
      );

      for (const key in schemas) {
        const schema = schemas[key];
        const d = schema.describe();

        const externalImports = findExternalImportsInJoiDescription(d);
        for (const name in externalImports) {
          const importPath = externalImports[name];
          let absolutePath: string;
          if (path.isAbsolute(importPath)) {
            const rel = path.relative(path.dirname(file), importPath).replaceAll(path.sep, '/');
            absolutePath = /^\w/.test(rel) ? './' + rel : rel;
          } else {
            // Try to resolve the module, or fail
            require.resolve(importPath);
            absolutePath = importPath;
          }

          debug(`Found external import`, {
            name,
            path: absolutePath,
          });
          const importLine = `import { ${name} } from '${absolutePath}';`;
          newContents = importLine + `\n` + newContents;
        }
      }
    }

    for (const className of Object.keys(schemaExports)) {
      const { entryNames } = schemaExports[className];
      newContents += `
export type ${className + 'ConfigKey'} = ${entryNames.map((e) => JSON.stringify(e)).join(' | ')};
export const ${className + 'ConfigKeyFirst'} = ${JSON.stringify(entryNames[0])};
`;
    }

    fileCache[file] = newContents;
  }

  // Process typeRef docs
  for (const file of files) {
    {
      let newContents = fileCache[file];

      /*
       * Apply prettier here because we need to split lines of unions
       * newContents = await prettier.format(newContents, { filepath: file });
       */

      let isFirstMainExport = true;
      let intfMatch: RegExpMatchArray | null;
      const re = newIntfRegex();
      while ((intfMatch = re.exec(newContents)) != null) {
        const intfName = intfMatch[2];
        debug(`File ${file} intf match`, { intfName });

        // Resolve the missing import
        const definitionPath = interfacesDefinitionsMap[intfName];
        if (definitionPath == null) {
          throw new Error(`Definition path not found for interface ${intfName} in ${file}`);
        }

        const relPath = path.relative(path.dirname(file), definitionPath).replaceAll(path.sep, '/');

        // Add a docs reference to the beginning of the field definition and a doc annotation on the type
        let indexSkew = 0;
        const matchIdx = intfMatch.index!;
        const matchLen = intfMatch[0].length;

        const originalText = intfMatch[0];
        // Find if this type is one of the main exports of the destination (relPath)
        const schemaFile = path.resolve(path.dirname(file), relPath).replace('.gen.ts', '.ts');
        const { schemaExports } = await findSchemaExports(schemaFile);
        const isMainExport = intfName in schemaExports;

        let newText = originalText;

        if (isMainExport && isFirstMainExport) {
          isFirstMainExport = false;
          // Mark the beginning of modules section
          newText =
            indentString(
              `
              //
              // ========= Available modules =========
              //  
              // Only one of the following keys can be
              // used at the same time. 
              //
              `,
              2,
            ) +
            '\n' +
            newText;
        }

        newText +=
          ' ' +
          getTypeRefString(intfName, relPath, isMainExport) +

          /*
           * NOTE: this newline is important because it introduces a break between the
           * typeRef comment and any following block comment. DO NOT REMOVe
           */
          '\n';

        indexSkew += newText.length - originalText.length;

        const textPre = newContents.substring(0, matchIdx);
        const textPost = newContents.substring(matchIdx + matchLen);

        newContents = textPre + newText + textPost;

        re.lastIndex += indexSkew;
      }

      fileCache[file] = newContents;
    }
  }

  // Apply a final round of formatting
  for (const file of files) {
    const contents = fileCache[file];
    let newContents = contents;

    newContents = await formatTSCode(file, newContents);

    fileCache[file] = newContents;
  }

  for (const file of files) {
    const contentsOriginal = fileCacheOriginal[file];
    let newContents = fileCache[file];

    if (!newContents.includes(generatedHeader)) {
      newContents = generatedHeader + '\n\n' + newContents;
    }

    if (newContents != contentsOriginal) {
      debug(`Editing file ${file}`);
      await fsPromiseWriteFile(file, newContents);
    }
  }
}

let esLintConfigCache: object | undefined;
let esLintCache: ESLint | undefined;

async function formatTSCode(filePath: string, source: string): Promise<string> {
  // https://eslint.org/docs/latest/integrate/nodejs-api

  if (esLintConfigCache == null) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const config = require('../.eslintrc.cjs');
    config.ignorePatterns = [];
    config.rules['@typescript-eslint/no-explicit-any'] = 'off';
    esLintConfigCache = config;
  }

  if (esLintCache == null) {
    esLintCache = new ESLint({
      useEslintrc: false,
      baseConfig: esLintConfigCache,
      fix: true,
    });
  }

  // 2. Lint text.
  const results = await esLintCache.lintText(source, { filePath });
  if (results.length != 1) {
    // If 0, the file is being ignored!
    throw new Error(`Unexpected eslint results length for ${filePath}: ${results.length}`);
  }

  if (results[0].errorCount > 0) {
    throw new Error(`Found linting errors for ${filePath}: ${JSON.stringify(results[0])}`);
  }

  // If no output exists, it means there is nothing to fix
  return results[0].output ?? source;
}

function findExternalImportsInJoiDescription(description: Joi.Description) {
  const importedItems: Record<string, string> = {};

  const externalImport: JoiMetaExternalImport = description.metas?.find((m) => joiMetaExternalImportKey in m)?.[
    joiMetaExternalImportKey
  ];
  if (externalImport) {
    importedItems[externalImport.name] = externalImport.importPath;
  }

  // Process all children types
  if (description.type == 'object') {
    for (const key in description.keys) {
      Object.assign(importedItems, findExternalImportsInJoiDescription(description.keys[key]));
    }
  } else if (description.type == 'array') {
    // Array
    for (const item of description.items) {
      Object.assign(importedItems, findExternalImportsInJoiDescription(item));
    }
  }

  return importedItems;
}

async function genSchemaFolder(folderPath: string) {
  console.log(`Processing ${folderPath}`);
  await convertFromDirectory({
    schemaDirectory: folderPath,
    typeOutputDirectory: folderPath,
    flattenTree: false,
    omitIndexFiles: true,
    interfaceFileSuffix: '.gen',
    inputFileFilter: /schema\.(ts)$/,
    treatDefaultedOptionalAsRequired: true,
    supplyDefaultsInType: true,
    fileHeader: generatedHeader,
    sortPropertiesByName: false,
    tsContentHeader: (t) => `// [block ${t.interfaceOrTypeName} begin]`,
    tsContentFooter: (t) => `// [block ${t.interfaceOrTypeName} end]`,
    unionNewLine: true,
    tupleNewLine: true,
  });
}

// const fixPrismaSchemas = async (file: string) => {
//   const contents = fs.readFileSync(file, 'utf-8');
//   let newContents = contents;
//
//   // Fixes
//   /*
//   addExportSchemaObject(schema: string) {
//     return `export const ${this.name}SchemaObject = ${schema}`;
//   }
//
//   addExportSchema(schema: string, name: string) {
//     return `export const ${name}Schema = ${schema}`;
//   }
//    */
//   newContents = newContents.replaceAll(/export const (\w+)Schema = (.+);/gs, (match, p1, p2) => {
//     return `export const ${p1}Schema = ${p2}.meta({className: '${p1}Interface'});`;
//   });
//
//   if (newContents != contents) {
//     debug(`Editing file ${file}`);
//     fs.writeFileSync(file, newContents);
//   }
// };

async function fileContains(p: string, ...values: string[]): Promise<boolean> {
  const contents = await fsPromiseReadFile(p, 'utf8');
  for (const value of values) {
    if (!contents.includes(value)) {
      return false;
    }
  }
  return true;
}

interface ImportGroup {
  // e.g. loadAll.configProvider.gen.ts => .configProvider
  genFileSuffix: string;
  excludeFromAll: boolean;
}

async function generateDocsNav(registryFolder: string, subFolders: string[]) {
  /*
   *### REPLACE NAV BEGIN
   *- File: ./file/README.md
   *### REPLACE NAV END
   */

  const registryName = path.basename(registryFolder);
  const ymlFile = path.join(docsNavBasePath, `mkdocs.${registryName}.yaml`);

  if (!(await fsPromiseExists(ymlFile))) {
    await fsPromiseWriteFile(
      ymlFile,
      `
site_name: ${registryName}
docs_dir: ../../src/${registryName}

nav:
  ### REPLACE NAV BEGIN
  ### REPLACE NAV END    
`,
    );
  }

  let contents = await fsPromiseReadFile(ymlFile, 'utf-8');

  const originalContent = contents;
  const match = /^(\s+)### REPLACE NAV BEGIN\n(.*)### REPLACE NAV END/ms.exec(contents);
  if (match) {
    const [fullMatch, indent] = match;
    debug(`Found nav replace match`, {
      ymlFile,
      fullMatch,
    });
    const navEntries = subFolders.map((sf) => `- "${sf}": ./${sf}/README.md`);
    const lines = ['### REPLACE NAV BEGIN', ...navEntries, '### REPLACE NAV END'];
    contents = contents.replace(fullMatch, lines.map((line) => `${indent}${line}`).join('\n'));
  }
  if (originalContent != contents) {
    debug(`Editing docs nav file`, { ymlFile });
    await fsPromiseWriteFile(ymlFile, contents);
  }
}

const systemInformationSchemaExclusionList = ['getStaticData', 'getDynamicData', 'getAllData', 'observe', 'get'];

async function genSystemInformationSchema(fnDescriptions?: Record<string, string>) {
  const typesFile = path.resolve(__dirname, '..', path.normalize('node_modules/systeminformation/lib/index.d.ts'));
  const out = path.resolve(__dirname, '..', path.normalize('src/modules/info/schema.ts'));
  const contents = await fsPromiseReadFile(typesFile, 'utf8');

  const getRegex = () => /export function (?<name>\w+)\([\n\s]*(?:(?<args>[^\n]+?),\s*?)?cb[^)]+\)[^;]+?;/gms;
  const getSchemaObjectEntry = (fullMatch: string, functionName: string, argsString?: string): string | null => {
    debug('Full match', {
      fullMatch,
      name: functionName,
      argsString,
    });
    let descStr = '';
    if (functionName in (fnDescriptions ?? {})) {
      const desc = fnDescriptions![functionName];
      descStr = `.description(\`${desc.replaceAll(`\``, `\\\``)}\`)`;
    }
    if (argsString == null) {
      return `${functionName}: Joi.boolean()${descStr}`;
    }

    const args = argsString.split(',').map((s) => s.trim());
    if (args.length == 0) {
      throw new Error(`Bad args, zero length: ${argsString}`);
    }
    // There are no significant functions that require more than 1 arg at the moment
    if (args.length > 1) {
      throw new Error(`Found si func with more than 1 arg: ${functionName}`);
      // return null;
    }
    const arg = args[0];
    const match = /^(\w+)(\?)?:\s+(\w+)$/.exec(arg);
    if (match == null) {
      throw new Error(`Bad argument match: ${arg}`);
    }
    const [, argKey, optional, t] = match;

    let typeValidation: string;
    switch (t) {
      case 'string':
        typeValidation = 'Joi.string()';
        break;
      case 'boolean':
        typeValidation = 'Joi.boolean()';
        break;
      case 'any':
        typeValidation = 'Joi.any()';
        break;
      default:
        throw new Error(`Unsupported type: ${t}`);
    }
    const optionalStr = optional == '?' ? '' : '.required()';
    return `${functionName}: Joi.object({${argKey}: ${typeValidation}${optionalStr}})${descStr}`;
  };

  /*
   *export function networkInterfaceDefault(cb?: (data: string) => any): Promise<string>;
   *export function networkGatewayDefault(cb?: (data: string) => any): Promise<string>;
   *export function networkInterfaces(
   *  cb?:
   *    | ((data: Systeminformation.NetworkInterfacesData[] | Systeminformation.NetworkInterfacesData) => any)
   *    | boolean
   *    | string,
   *  rescan?: boolean,
   *  defaultString?: string
   *): Promise<Systeminformation.NetworkInterfacesData[] | Systeminformation.NetworkInterfacesData>;
   *
   *export function networkStats(ifaces?: string, cb?: (data: Systeminformation.NetworkStatsData[]) => any): Promise<Systeminformation.NetworkStatsData[]>;
   */

  const schemaEntries: string[] = [];

  const regex = getRegex();
  let match: RegExpExecArray | null = null;
  while ((match = regex.exec(contents)) != null) {
    const [fullMatch, name, args] = match;
    if (systemInformationSchemaExclusionList.includes(name)) {
      continue;
    }
    const entryStr = getSchemaObjectEntry(fullMatch, name, args);
    if (entryStr) {
      schemaEntries.push(entryStr);
    }
  }

  const schemaContent = `
import Joi from 'joi';
import { moduleRegistryEntryFactory } from '../registry';

// Docs can be found at: https://systeminformation.io/#docs

export const ModuleInfoSchema = moduleRegistryEntryFactory.createJoiEntrySchema(
  __dirname,
  Joi.object({
    ${schemaEntries.join(',\n    ')}
  }),
);
  `;

  let newContents = generatedHeader + '\n\n' + schemaContent;
  newContents = await prettier.format(newContents, { filepath: out });
  newContents = await formatTSCode(out, newContents);

  await fsPromiseWriteFile(out, newContents, 'utf8');
}

async function genSystemInformationReadme() {
  const siReadme = path.resolve(__dirname, '..', path.normalize('node_modules/systeminformation/README.md'));
  const readmeTemplate = path.resolve(__dirname, '..', path.normalize('src/modules/info/README.template.md'));
  const out = path.resolve(__dirname, '..', path.normalize('src/modules/info/README.md'));

  let contents = await fsPromiseReadFile(readmeTemplate, 'utf8');
  const siReadmeContents = await fsPromiseReadFile(siReadme, 'utf8');

  // Extract the relevant reference from the si readme
  const blockBegin = '#### 2. System (HW)';
  const blockEnd = '#### 16. "Get All / Observe" - functions';

  const blockBeginIdx = siReadmeContents.indexOf(blockBegin);
  if (blockBeginIdx == -1) {
    throw new Error(`systeminformation block begin not found!`);
  }
  const blockEndIdx = siReadmeContents.indexOf(blockEnd);
  if (blockEndIdx == -1) {
    throw new Error(`systeminformation block end not found!`);
  }

  let headingCounter = 1;
  const fnDescriptions: Record<string, string> = {};
  const extracted = siReadmeContents
    .substring(blockBeginIdx, blockEndIdx)
    // Replace headings with proper count
    .replaceAll(/^#### \d+\. (.+)$/gm, (m, title) => `#### ${headingCounter++}. ${title}`)

    /*
     * Who uses [][] as link in md D:
     * https://github.github.com/gfm/#links
     */
    .replaceAll(/\[([^\]]+)]\[([^\]]+)]/g, '[$1]($2)')

    /*
     * Fix all table's entries
     * | si.system(cb)    | {...}         | X     | X   | X   | X   |     | hardware information             |
     */
    .replaceAll(
      /^\| (?:si\.((\w+)\([^)]*\))|\s+)[^|]+\| (.+?)\s+\|(.*)\|([^|]*)\|$/gm,
      (
        str,
        method: string | undefined,
        methodName: string | undefined,
        result: string,
        rest: string,
        description: string,
      ) => {
        const methodFixed = method ? '`' + method.replace(/\((.+), ?cb\)|\(cb\)$/, '($1)') + '`' : '';
        description = description.trim();
        if (methodName && description != '') {
          fnDescriptions[methodName] = description.replaceAll(/<br[^>]*>/g, '\n');
        }
        return `| ${methodFixed} | \`${result}\` | ${rest} | ${description} |`;
      },
    )

    /*
     * Strip out non-supported columns
     * | Function         | Result object | Linux | BSD | Mac | Win | Sun | Comments                         |
     */
    .replaceAll(/^\|(.+)\|$/gm, (match, contents: string) => {
      return (
        '|' +
        contents
          .split('|')
          .filter((val, idx) => ![3, 6].includes(idx))
          .join('|') +
          '|'
      );
    });

  contents = contents.replace('REPLACE_README_HERE', extracted);

  await fsPromiseWriteFile(out, contents, 'utf8');

  return fnDescriptions;
}

async function main() {
  /*
   * Fix prisma generated entries
   * await Promise.all(prismaGlobList.map(fixPrismaSchemas));
   */

  {
    const siFnDesc = await genSystemInformationReadme();
    await genSystemInformationSchema(siFnDesc);
  }
  await genRegistriesEntries();
  await genSchemaFolders();
  await fixGenImports();
}

void main();
