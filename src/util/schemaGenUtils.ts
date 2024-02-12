/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { toPascalCase } from 'js-convert-case';
import path from 'node:path';

/*
 * export const registryExportsSchemaFileName = 'registryExports.schema.ts';
 * export const registryExportsInterfaceFileName = 'registryExports.schema.gen.ts';
 */

export interface TypeRefMeta {
  relPath: string;
  isRegistryExport?: boolean;
}

export function getTypeRefString(intfName: string, meta: TypeRefMeta): string {
  return `//typeRef:${intfName}:${JSON.stringify(meta)}`;
}

export function getRegistryEntriesSchemaBaseName(registryFolder: string) {
  return `RegistryEntries${toPascalCase(path.basename(registryFolder))}`;
}

/*
 * export function getRegistryEntriesTypeRefString(registryFolder: string, from: string): string {
 *   const intfName = `${getRegistryEntriesSchemaBaseName(registryFolder)}Interface`;
 *   const meta: TypeRefMeta = {
 *     relPath: path
 *     .relative(from, path.join(__dirname, '..', registryFolder, registryExportsInterfaceFileName))
 *     .replaceAll('\\', '/'),
 *   };
 *   return `##typeRef:${intfName}:${JSON.stringify(meta)}`;
 * }
 */
