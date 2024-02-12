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
import { fsPromiseStat, fsPromiseTmpDir, fsPromiseTmpFile, fsPromiseWriteFile, getAllFiles } from '../../src/util/fs';
import Joi from 'joi';
import { verifyS3WriteAccess } from '../../src/util/s3';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import path from 'node:path';
import { normalizePathToUnix } from '../../src/util/path';
import fs from 'node:fs';
import { bytesToHuman } from '../../src/util/bytesToHuman';
import { ciRootDir } from './common';
import type { CmdCIGenHackInstallerConfigInterface } from '../../src/ci/ciGenHackInstaller.schema.gen';
import { build } from './ciGenHackInstaller';
import { dumpYAML } from '../../src/util/yaml';
import type { ContextLogger } from '../../src/util/context';

const argsConfig: ParseArgsConfig = {
  allowPositionals: false,
  strict: true,
  options: {
    ...parseArgsLogOptions,
    bucket: {
      type: 'string',
    },
    publicUrl: {
      type: 'string',
    },
    prefix: {
      type: 'string',
      default: 'artifacts/dev',
    },
    onlyScripts: {
      type: 'boolean',
      default: false,
    },
  },
};

const s3Client = new S3Client({});

/**
 * Generates development artifacts and uploads them to S3.
 */
async function main() {
  const { values } = parseArgs(argsConfig);
  const { bucket, publicUrl, prefix, onlyScripts, ...otherArgs } = joiAttemptRequired(
    values,
    joiParseArgsLogOptionsSchema.append({
      bucket: Joi.string().required(),
      publicUrl: Joi.string().required(),
      prefix: Joi.string().required(),
      onlyScripts: Joi.boolean(),
    }),
    'Error evaluating command args:'
  );
  const context = cliContextLoggerFromArgs(otherArgs);

  await verifyS3WriteAccess(s3Client, bucket, prefix);

  if (!onlyScripts) {
    const genDir = await generateAllDevArtifacts(context, bucket, prefix);

    // Upload artifacts
    const files = await getAllFiles(genDir);
    context.logger.info('All files to upload', { files });
    for (const file of files) {
      const filePath = path.join(genDir, file);
      await uploadFile(context, filePath, bucket, prefix, file);
    }
  }

  const cliFile = await buildCLIInstallerScript(context, publicUrl, prefix);
  await uploadFile(context, cliFile, bucket, prefix, 'install.cli.sh');

  context.logger.info(`Done`);
}

async function buildCLIInstallerScript(context: ContextLogger, publicUrl: string, prefix: string) {
  /*
   * Special case, instead of generating a bunch of new af, we generate and upload the scripts
   * using the already existing latest
   */
  const tmpFile = await fsPromiseTmpFile({
    keep: false,
    discardDescriptor: true,
  });
  const artifactsConfig: CmdCIGenHackInstallerConfigInterface = {
    scripts: [
      {
        src: 'install.cli.sh',
        dest: tmpFile,
        template: true,
      },
    ],
  };
  await fsPromiseWriteFile(tmpFile, dumpYAML(artifactsConfig));
  await build(context, {
    artifactsUrl: `${publicUrl}/${prefix}`,
    artifactsFile: tmpFile,
  });
  return tmpFile;
}

async function uploadFile(context: ContextLogger, filePath: string, bucket: string, prefix: string, file: string) {
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

async function generateAllDevArtifacts(context: ContextLogger, bucket: string, prefix: string) {
  // Generate a new version
  const version = await getBuildVersion(context, { method: BuildVersionMethod.timestamp });

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
      cwd: ciRootDir,
      env: {
        ...process.env,
        ...env,
      },
      streamLogs: true,
    });
  }
  return tmp;
}

void main();
