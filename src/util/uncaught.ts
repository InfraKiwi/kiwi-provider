import type { Logger } from 'winston';

export function setupUncaughtHandler(logger: Logger) {
  process
    .on('unhandledRejection', (reason, p) => {
      logger.error(`Unhandled rejection`, { reason });
      process.exit(1);
    })
    .on('uncaughtException', (err) => {
      logger.error(`Uncaught exception`, { err });
      process.exit(1);
    });
}
