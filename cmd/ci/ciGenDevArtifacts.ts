/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { cliContextLoggerFromArgs, joiParseArgsLogOptionsSchema, parseArgsLogOptions } from '../../src/util/logger';
import type { ParseArgsConfig } from 'node:util';
import { parseArgs } from 'node:util';
import { joiAttemptRequired } from '../../src/util/joi';

import {
  BuildVersionMethod,
  BuildVersionMethodEnv,
  BuildVersionMethodEnvMethodEnv,
  getBuildVersion,
  getPackageJSON,
} from '../../src/util/package';
import { execShell } from '../../src/util/exec';
import { fsPromiseStat, fsPromiseTmpDir, fsPromiseWriteFile, getAllFiles } from '../../src/util/fs';
import Joi from 'joi';
import { s3Client } from '../../src/util/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'node:path';
import { normalizePathToUnix } from '../../src/util/path';
import fs from 'node:fs';
import { bytesToHuman } from '../../src/util/bytesToHuman';

const argsConfig: ParseArgsConfig = {
  allowPositionals: false,
  strict: true,
  options: {
    ...parseArgsLogOptions,
    bucket: {
      type: 'string',
    },
    prefix: {
      type: 'string',
      default: 'artifacts/dev',
    },
  },
};

// NOTE: BUILD_VERSION_METHOD

async function main() {
  const { values } = parseArgs(argsConfig);
  const { bucket, prefix, ...otherArgs } = joiAttemptRequired(
    values,
    joiParseArgsLogOptionsSchema.append({
      bucket: Joi.string().required(),
      prefix: Joi.string().required(),
    }),
    'Error evaluating command args:'
  );
  const context = cliContextLoggerFromArgs(otherArgs);

  // Verify API access
  {
    await s3Client.send(
      new PutObjectCommand({
        Body: `${new Date().getTime()}`,
        Bucket: bucket,
        Key: normalizePathToUnix(path.join(prefix, '.uploadTest')),
      })
    );
  }

  // Generate a new version
  const version = await getBuildVersion(context, BuildVersionMethod.timestamp);

  const env = {
    [BuildVersionMethodEnv]: BuildVersionMethod.env,
    [BuildVersionMethodEnvMethodEnv]: version,
  };

  const tmp = await fsPromiseTmpDir({ keep: false });
  await fsPromiseWriteFile(path.join(tmp, 'latest'), version);

  // Build artifacts
  {
    const cmd = (await getPackageJSON()).scripts['dist:pkg:dev'];
    await execShell(context, `${cmd} --outDir "${tmp}"`, {
      cwd: path.join(__dirname, '..', '..'),
      env: {
        ...process.env,
        ...env,
      },
      streamLogs: true,
    });
  }

  // Upload artifacts
  const files = await getAllFiles(tmp);
  context.logger.info('All files to upload', { files });
  for (const file of files) {
    const filePath = path.join(tmp, file);
    context.logger.info(`Uploading ${file} (size ${bytesToHuman((await fsPromiseStat(filePath)).size)})`);
    const stream = fs.createReadStream(filePath);
    const result = await s3Client.send(
      new PutObjectCommand({
        Body: stream,
        Bucket: bucket,
        Key: normalizePathToUnix(path.join(prefix, file)),
      })
    );
    context.logger.info(`Uploaded ${file}`, { result });
  }
  context.logger.info(`Done`);
}

void main();
