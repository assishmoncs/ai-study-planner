import 'dotenv/config';
import mongoose from 'mongoose';
import app from './src/app';
import connectDB from './src/config/db';
import { validateEnv } from './src/config/env';
import logger from './src/utils/logger';

const PORT = process.env.PORT || 5000;

/**
 * Bootstraps environment validation, MongoDB connection, HTTP server,
 * and graceful OS signal shutdown handlers.
 */
export const startServer = async () => {
  validateEnv();
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully...`);
    server.close(async () => {
      await mongoose.connection.close(false);
      logger.info('HTTP server and database connections closed.');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000).unref();
  };

  ['SIGTERM', 'SIGINT'].forEach((signal) => process.on(signal, () => shutdown(signal)));

  process.on('unhandledRejection', (reason: unknown) => {
    logger.error({ err: reason }, 'Unhandled promise rejection');
  });
  process.on('uncaughtException', (err: Error) => {
    logger.fatal({ err }, 'Uncaught exception, exiting');
    process.exit(1);
  });

  return server;
};

if (require.main === module) {
  startServer();
}
