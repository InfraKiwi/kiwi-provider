/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RunContext } from '../../util/runContext';
import { ModuleCopySchema } from './schema';
import type { ModuleCopyInterface } from './schema.gen';
import { moduleRegistryEntryFactory } from '../registry';
import type { ModuleRunResult } from '../abstractModuleBase';
import { AbstractModuleBase } from '../abstractModuleBase';
import { MultiDataSourceGlob } from '../../dataSources/glob';
import { fsPromiseCp, fsPromiseIsDir, fsPromiseMkdir, fsPromiseReadFile, fsPromiseWriteFile } from '../../util/fs';
import path from 'node:path';
import { normalizePathToUnix } from '../../util/path';
import { Template } from '../../util/tpl';

export interface ModuleCopyResult {
  files: string[];
  templated: string[];
}

const processAllTemplates = '*';

export class ModuleCopy extends AbstractModuleBase<ModuleCopyInterface, ModuleCopyResult> {
  async #processTemplate(context: RunContext, srcPath: string, dstPath: string) {
    const tpl = new Template(await fsPromiseReadFile(srcPath, 'utf-8'));
    const content = await tpl.render(context.varsForTemplate);
    await fsPromiseWriteFile(dstPath, content);
  }

  async run(context: RunContext): Promise<ModuleRunResult<ModuleCopyResult>> {
    const filesToTemplate: string[] = [];
    const templatedFiles: string[] = [];

    let processTemplates = false;
    if (typeof this.config.template == 'string' || Array.isArray(this.config.template)) {
      const ds = new MultiDataSourceGlob({
        workDir: typeof this.config.from == 'string' ? undefined : this.config.from.workDir,
        pattern: this.config.template,
      });
      filesToTemplate.push(...(await ds.listEntries(context)));
      processTemplates = true;
    } else if (this.config.template == true) {
      filesToTemplate.push(processAllTemplates);
      processTemplates = true;
    }

    if (typeof this.config.from == 'string') {
      const srcPath = this.config.from;
      let dstPath: string;
      if ((await fsPromiseIsDir(this.config.to)) || this.config.to.endsWith('/') || this.config.to.endsWith(path.sep)) {
        // Folder
        dstPath =
          this.config.to.endsWith('/') || this.config.to.endsWith(path.sep)
            ? path.join(this.config.to.substring(0, this.config.to.length - 1), path.basename(srcPath))
            : this.config.to;
      } else {
        // File
        dstPath = this.config.to;
      }

      const dstDir = path.dirname(dstPath);
      await fsPromiseMkdir(dstDir, { recursive: true });
      if (processTemplates && (filesToTemplate.includes(processAllTemplates) || filesToTemplate.includes(srcPath))) {
        await this.#processTemplate(context, srcPath, dstPath);
        templatedFiles.push(srcPath);
      } else {
        await fsPromiseCp(srcPath, dstPath);
      }

      return {
        vars: {
          files: [normalizePathToUnix(srcPath)],
          templated: templatedFiles.map(normalizePathToUnix),
        },
        changed: true,
      };
    }

    const ds = new MultiDataSourceGlob(this.config.from);
    const files = await ds.listEntries(context);

    for (const file of files) {
      const srcPath = path.join(this.config.from.workDir, file);
      const dstPath = path.join(this.config.to, file);
      const dstDir = path.dirname(dstPath);
      await fsPromiseMkdir(dstDir, { recursive: true });

      if (processTemplates && (filesToTemplate.includes(processAllTemplates) || filesToTemplate.includes(file))) {
        await this.#processTemplate(context, srcPath, dstPath);
        templatedFiles.push(file);
      } else {
        await fsPromiseCp(srcPath, dstPath);
      }
    }

    return {
      vars: {
        files: files.map(normalizePathToUnix),
        templated: templatedFiles.map(normalizePathToUnix),
      },
      changed: true,
    };
  }
}

moduleRegistryEntryFactory.register(ModuleCopySchema, ModuleCopy);
