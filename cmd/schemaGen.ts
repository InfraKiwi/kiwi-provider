import { newDebug } from '../src/util/debug';
import { glob, globSync } from 'glob';
import path from 'node:path';
import { convertFromDirectory } from 'joi-to-typescript';
import * as fs from 'node:fs';
import type Joi from 'joi';
import type { JoiMetaExternalImport } from '../src/util/joi';
import { joiMetaExternalImportKey } from '../src/util/joi';
import { fsPromiseExists, fsPromiseReadDir, fsPromiseReadFile, fsPromiseRm, fsPromiseWriteFile } from '../src/util/fs';
import { asyncFilter } from '../src/util/async';
import { registryGetClassNameFromJoiSchema, registryGetEntryNamesFromJoiSchema } from '../src/util/registry';

const generatedHeader = '// Generated with: yarn gen -> cmd/schemaGen.ts\n\n';

const debug = newDebug(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.resolve(rootDir, 'src');

// const prismaPathGlob = path.resolve(rootDir, 'prisma', 'generated', 'schemas/**/*schema.ts').replaceAll(path.sep, '/');
// debug(`Looking for Prisma schemas in ${prismaPathGlob}`);
// const prismaGlobList = Array.from(globSync(prismaPathGlob));

async function fixGenImports() {
  const files = globSync(path.resolve(srcDir, '**/*schema.gen.ts').replaceAll(path.sep, '/'));

  debug('All files to be inspected', files);

  const fileCache: Record<string, string> = {};
  const fileCacheSchemaFile: Record<string, string> = {};
  for (const file of files) {
    const schemaFile = file.replace('.gen.ts', '.ts');
    const contents = fs.readFileSync(file, 'utf-8');
    const contentsSchemaFile = fs.readFileSync(schemaFile, 'utf-8');
    fileCache[file] = contents;
    fileCacheSchemaFile[file] = contentsSchemaFile;
  }

  // Extract all exports
  // Intf name / file path
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
    const importLines = contents.match(/^import (?:\{([^}]+)}|(\S+)) from/gm);
    if (importLines) {
      for (const line of new Set(importLines)) {
        const matches = line.match(/^import (?:\{([^}]+)}|(\S+)) from/);
        imported.push(...matches![1].split(',').map((s) => s.trim()));
      }
    }
    if (imported.length > 0) {
      debug(`Found imports in ${file}`, { imported });
    }

    const intfMatches = contents.match(/[:=].*\b(\w+Interface)\b/g);
    if (intfMatches) {
      const importLinesSet = new Set<string>();
      for (const intfMatch of new Set(intfMatches)) {
        const match = intfMatch.match(/[:=].*\b(\w+Interface)\b/);
        const intfName = match![1];
        debug(`File ${file} intf match`, { intfName });
        if (imported.includes(intfName) || interfacesDefinitionsMap[intfName] == file) {
          continue;
        }

        // Resolve the missing import
        const definitionPath = interfacesDefinitionsMap[intfName];
        if (definitionPath == null) {
          throw new Error(`Definition path not found for interface ${intfName} inf ${file}`);
        }

        const relPath = path
          .relative(path.dirname(file), definitionPath)
          .replace(/\.ts$/, '')
          .replaceAll(path.sep, '/');
        debug(`Calculating relative path`, { from: file, to: definitionPath, relPath });
        const importLine = `import { ${intfName} } from '${relPath}';`;
        importLinesSet.add(importLine);
      }
      if (importLinesSet.size > 0) {
        newContents = Array.from(importLinesSet).join('\n') + `\n` + newContents;
      }
    }

    if (!newContents.startsWith(generatedHeader)) {
      newContents = generatedHeader + newContents;
    }
    if (newContents != contents) {
      debug(`Editing file ${file}`);
      await fsPromiseWriteFile(file, newContents);
      fileCache[file] = newContents;
    }
  }

  // Then, after the initial fixes, we fix additional elements like instance imports
  for (const file of files) {
    const contents = fileCache[file];
    const contentsSchemaFile = fileCacheSchemaFile[file];
    let newContents = contents;
    const schemaFile = file.replace('.gen.ts', '.ts');
    const imported = await import(schemaFile);

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
          const absolutePath = externalImports[name];
          const p = path.relative(path.dirname(file), absolutePath).replaceAll(path.sep, '/');
          const pWithPrefix = /^\w/.test(p) ? './' + p : p;
          debug(`Found external import`, { name, path: pWithPrefix });
          const importLine = `import { ${name} } from '${pWithPrefix}';`;
          newContents = importLine + `\n` + newContents;
        }
      }
    }

    {
      // Find all registry entries
      // export const DataSourceFileRawSchema = dataSourceRegistryEntryFactory.createJoiEntrySchema(
      const createJoiEntrySchemaCalls = contentsSchemaFile.match(
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
            newContents +=
              `export type ${className + 'ConfigKey'} = ${entryNames.map((e) => JSON.stringify(e)).join(' | ')};` +
              '\n';
            newContents += `export const ${className + 'ConfigKeyFirst'} = ${JSON.stringify(entryNames[0])};` + '\n';
          }
        }
      }
    }

    if (!newContents.startsWith(generatedHeader)) {
      newContents = generatedHeader + newContents;
    }
    if (newContents != contents) {
      debug(`Editing file ${file}`);
      await fsPromiseWriteFile(file, newContents);
      fileCache[file] = newContents;
    }
  }
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
  // e.g. loadAll.serverConfig.gen.ts => .serverConfig
  genFileSuffix: string;
  excludeFromAll: boolean;
}

// Generate loadAll files for all registries
async function genRegistriesLoadAll() {
  // Scan for all folders containing a registry.ts file containing a `new RegistryEntryFactory` entry
  const pathGlob = path.resolve(srcDir, '**/registry.ts').replaceAll(path.sep, '/');
  const globRaw = await asyncFilter(
    await glob(pathGlob),
    async (p) => await fileContains(p, `new RegistryEntryFactory(`, `new Registry(`),
  );
  const globList = Array.from(new Set(globRaw.map((el) => el.substring(0, el.lastIndexOf(path.sep) + 1))));

  const importGroups: Record<string, ImportGroup> = {
    '.loadAllServerConfig': {
      genFileSuffix: '.serverConfig',
      excludeFromAll: true,
    },
  };

  const loadAllGroups: Record<string, string[]> = {
    all: [],
  };

  for (const folder of globList) {
    // Remove any loadAll gen files first
    for (const file of await glob(`${folder}/loadAll*.gen.ts`)) {
      await fsPromiseRm(file);
    }

    const subFolders = await fsPromiseReadDir(folder, { withFileTypes: true });

    const imports = subFolders
      .filter((p) => p.isDirectory() && !p.name.startsWith('_'))
      .map((p) => `import './${p.name}';`);

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
      await fsPromiseWriteFile(loadAllFile, generatedHeader + imports.join('\n'));
      loadAllGroups[checkFile] ??= [];
      loadAllGroups[checkFile].push(loadAllFile.replace(/\.ts$/, ''));
    }

    if (!excludeFromAll) {
      const loadAllFile = path.join(folder, 'loadAll.gen.ts');
      await fsPromiseWriteFile(loadAllFile, generatedHeader + imports.join('\n'));
      loadAllGroups['all'].push(loadAllFile.replace(/\.ts$/, ''));
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
    await fsPromiseWriteFile(loadAllCentralFile, generatedHeader + loadAllCentralImports.join('\n'));
  }
}

async function genSystemInformationSchema() {
  const p = path.resolve(__dirname, '..', path.normalize('node_modules/systeminformation/lib/index.d.ts'));
  const out = path.resolve(__dirname, '..', path.normalize('src/modules/info/gen.schema.ts'));
  const contents = await fsPromiseReadFile(p, 'utf8');

  const getRegex = () => /export function (?<name>\w+)\([\n\s]*(?:(?<args>[^\n]+?),\s*?)?cb[^)]+\)[^;]+?;/gms;
  const getSchemaObjectEntry = (fullMatch: string, functionName: string, argsString?: string): string | null => {
    debug('Full match', { fullMatch, name: functionName, argsString });
    if (argsString == null) {
      return `${functionName}: Joi.object({}).unknown(false)`;
    }

    const args = argsString.split(',').map((s) => s.trim());
    if (args.length == 0) {
      throw new Error(`Bad args, zero length: ${argsString}`);
    }
    // There are no significant functions that require more than 1 arg at the moment
    if (args.length > 1) {
      return null;
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
    return `${functionName}: Joi.object({${argKey}: ${typeValidation}${optionalStr}})`;
  };

  /*
  export function networkInterfaceDefault(cb?: (data: string) => any): Promise<string>;
  export function networkGatewayDefault(cb?: (data: string) => any): Promise<string>;
  export function networkInterfaces(
    cb?:
      | ((data: Systeminformation.NetworkInterfacesData[] | Systeminformation.NetworkInterfacesData) => any)
      | boolean
      | string,
    rescan?: boolean,
    defaultString?: string
  ): Promise<Systeminformation.NetworkInterfacesData[] | Systeminformation.NetworkInterfacesData>;
  
  export function networkStats(ifaces?: string, cb?: (data: Systeminformation.NetworkStatsData[]) => any): Promise<Systeminformation.NetworkStatsData[]>;
  */

  const schemaEntries: string[] = [];

  const regex = getRegex();
  let match: RegExpExecArray | null = null;
  while ((match = regex.exec(contents)) != null) {
    const [fullMatch, name, args] = match;
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

  await fsPromiseWriteFile(out, generatedHeader + schemaContent, 'utf8');
}

const genSchemaFolders = async () => {
  // Scan for all object types that can generate a schema
  const pathGlob = path.resolve(srcDir, '**/*schema.ts').replaceAll(path.sep, '/');
  debug(`Looking for schemas in ${pathGlob}`);
  const globRaw = await glob(pathGlob);
  const globList = Array.from(new Set(globRaw.map((el) => el.substring(0, el.lastIndexOf(path.sep) + 1))));
  debug(`GlobList`, { globRaw, globList });

  for (const p of globList) {
    await genSchemaFolder(p);
  }

  // Fix the rest
  // const pL = pLimit(1);
  // await Promise.all(globList.map((l) => pL(() => genSchemaFolder(l))));
};

(async () => {
  // Fix prisma generated entries
  // await Promise.all(prismaGlobList.map(fixPrismaSchemas));

  await genSystemInformationSchema();
  await genRegistriesLoadAll();
  await genSchemaFolders();
  await fixGenImports();
})();
