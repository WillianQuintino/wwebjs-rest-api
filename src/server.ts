import app from './app';
import { env, logger } from './config';
import { whatsAppClientService } from './services';

// Cleanup de sessões antigas ao iniciar
whatsAppClientService.cleanupOldSessions();

const server = app.listen(env.port, () => {
  logger.info(`🚀 Server started on port ${env.port}`);
  logger.info(`📝 Environment: ${env.nodeEnv}`);
  logger.info(`🔗 API URL: http://localhost:${env.port}${env.apiPrefix}/${env.apiVersion}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});

// Uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default server;
