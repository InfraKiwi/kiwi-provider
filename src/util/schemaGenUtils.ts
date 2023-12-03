import { toPascalCase } from 'js-convert-case';
import path from 'node:path';

export const registryExportsSchemaFileName = 'registryExports.schema.ts';
export const registryExportsInterfaceFileName = 'registryExports.schema.gen.ts';

export function getTypeRefString(intfName: string, relPath: string, isMainExport = false): string {
  return `//typeRef:${intfName}:${relPath}:${isMainExport}`;
}

export function getRegistryEntriesSchemaBaseName(registryFolder: string) {
  return `registryEntries${toPascalCase(path.basename(registryFolder))}`;
}

export function getRegistryEntriesTypeRefString(registryFolder: string, from: string): string {
  const intfName = `${getRegistryEntriesSchemaBaseName(registryFolder)}Interface`;
  return `//typeRef:${intfName}:${path
    .relative(from, path.join(__dirname, '..', registryFolder, registryExportsInterfaceFileName))
    .replaceAll('\\', '/')}:${false}`;
}
