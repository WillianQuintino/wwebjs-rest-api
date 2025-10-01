import winston from 'winston';
import path from 'path';
import { env } from './env';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Formato customizado de log
const customFormat = printf(({ level, message, timestamp, stack }) => {
  if (stack) {
    return `${timestamp} [${level}]: ${message}\n${stack}`;
  }
  return `${timestamp} [${level}]: ${message}`;
});

// Transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      customFormat
    ),
  }),
];

// File transports apenas em produção
if (env.isProduction) {
  transports.push(
    new winston.transports.File({
      filename: path.join(env.logPath, 'error.log'),
      level: 'error',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        customFormat
      ),
    }),
    new winston.transports.File({
      filename: path.join(env.logPath, 'combined.log'),
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        customFormat
      ),
    })
  );
}

// Cria o logger
export const logger = winston.createLogger({
  level: env.logLevel,
  transports,
  exitOnError: false,
});

// Stream para o Morgan
export const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};
