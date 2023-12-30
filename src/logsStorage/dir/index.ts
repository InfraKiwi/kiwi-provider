/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { LogsStorageContext } from '../abstractLogsStorage';
import { AbstractLogsStorage } from '../abstractLogsStorage';
import { logsStorageRegistryEntryFactory } from '../registry';
import { LogsStorageDirSchema } from './schema';
import type { LogsStorageDirInterface } from './schema.gen';
import type e from 'express';
import type { Multer } from 'multer';
import multer from 'multer';
import path from 'node:path';
import type { HostLogs } from '@prisma/client';
import { mkdirp } from 'mkdirp';

interface LogsStorageUploadRequest extends e.Request {
  record: HostLogs;
}

export class LogsStorageDir extends AbstractLogsStorage<LogsStorageDirInterface> {
  #upload: Multer;
  #storagePath: string;

  constructor(config: LogsStorageDirInterface) {
    super(config);

    let storagePath = path.normalize(this.config.path);
    // We need to provide an absolute path to sendFile
    if (!path.isAbsolute(storagePath)) {
      storagePath = path.join(process.cwd(), storagePath);
    }
    this.#storagePath = storagePath;
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const storageKey = (req as LogsStorageUploadRequest).record.storageKey;
        const dirName = path.dirname(storageKey);
        const fullPath = path.join(this.#storagePath, dirName);
        mkdirp(fullPath)
          .then(() => cb(null, fullPath))
          .catch((err) => cb(err, ''));
      },
      filename: (req, file, cb) => {
        const storageKey = (req as LogsStorageUploadRequest).record.storageKey;
        const fileName = path.basename(storageKey);
        cb(null, fileName);
      },
    });

    // Create the multer instance
    this.#upload = multer({ storage: storage });
  }

  async getDownloadUrl(context: LogsStorageContext, hash: string): Promise<string> {
    return `./download/${hash}`;
  }

  mountRoutes(context: LogsStorageContext, appForHost: e.IRouter, appForAdmin: e.IRouter) {
    appForHost.put(
      '/upload/:hash',
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async (req, res, next) => {
        const hash = req.params.hash;
        // Make sure there is a database entry for this
        const record = await context.client.hostLogs.findFirstOrThrow({
          where: {
            hash,
            completed: false,
          },
        });
        (req as LogsStorageUploadRequest).record = record;
        next();
      },
      this.#upload.single('file'),
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async (req, res) => {
        const record = await AbstractLogsStorage.markUploadAsCompleted(
          context,
          (req as LogsStorageUploadRequest).record.hash,
          req.file?.size
        );
        // Handle the uploaded file
        res.json({
          message: 'Logs uploaded successfully!',
          record,
        });
      }
    );

    appForAdmin.get(
      '/download/:hash',
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async (req, res) => {
        const hash = req.params.hash;
        const record = await context.client.hostLogs.findFirstOrThrow({
          where: {
            hash,
            completed: true,
          },
        });
        const filePath = path.join(this.#storagePath, record.storageKey);

        if (req.query.download) {
          res.download(filePath, record.storageKey);
        } else {
          res.sendFile(filePath, {
            root: context.workDir,
            headers: { 'Content-Type': 'text/plain' },
          });
        }
      }
    );
  }

  async getUploadUrl(context: LogsStorageContext, storageKey: string): Promise<string> {
    return `./upload/${storageKey}`;
  }
}

logsStorageRegistryEntryFactory.register(LogsStorageDirSchema, LogsStorageDir);
