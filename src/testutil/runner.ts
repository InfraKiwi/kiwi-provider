/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { AbstractRunnerInstance } from '../runners/abstractRunner';
import type { ContextLogger } from '../util/context';
import { defaultLogger } from '../util/logger';
import type { Server } from 'node:http';
import { createHttpTerminator } from 'http-terminator';

let runners: AbstractRunnerInstance[] = [];
let servers: Server[] = [];

export function testUtilRegisterRunner(runner: AbstractRunnerInstance) {
  runners.push(runner);
}

export function testUtilRegisterServer(server: Server) {
  servers.push(server);
}

export async function testUtilTearDown(context?: ContextLogger) {
  context ??= { logger: defaultLogger };

  for (const runner of runners) {
    await runner.tearDown(context).catch((err) => context!.logger.error(`Failed to tear down test runner`, { err }));
  }
  runners = [];

  for (const server of servers) {
    const t = createHttpTerminator({
      gracefulTerminationTimeout: 0,
      server,
    });
    await t.terminate().catch((err) => context!.logger.error(`Failed to tear down test server`, { err }));
  }
  servers = [];
}
