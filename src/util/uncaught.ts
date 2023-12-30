/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { Logger } from 'winston';

export function setupUncaughtHandler(logger: Logger) {
  process
    .on('unhandledRejection', (reason, p) => {
      logger.error('Unhandled rejection', { reason });
      logger.end();
      process.exit(1);
    })
    .on('uncaughtException', (err) => {
      logger.error('Uncaught exception', { err });
      logger.end();
      process.exit(1);
    });
}
