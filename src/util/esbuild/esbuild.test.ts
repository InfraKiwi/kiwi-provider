/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe } from '@jest/globals';
import { generateESBuildBundleFromFile } from './esbuild';
import { newLogger } from '../logger';
import type { ContextLogger } from '../context';
import path from 'node:path';
import { createRequire } from 'node:module';
import { helloWorld } from './test/ts2';

const logger = newLogger();
const context: ContextLogger = { logger };

const testDir = path.join(__dirname, 'test');

const requireOnDemand = createRequire(__filename);

describe(`esbuild util`, () => {
  test('bundle from file (ts)', async () => {
    const bundleFileName = await generateESBuildBundleFromFile(context, path.join(testDir, 'ts1.ts'));
    expect(bundleFileName).not.toBeUndefined();

    const bundle = requireOnDemand(bundleFileName);
    expect(bundle.sayHello).toBeInstanceOf(Function);
    expect(bundle.sayHello()).toEqual(helloWorld);
  });
});
