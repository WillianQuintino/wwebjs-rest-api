import dotenv from 'dotenv';
import path from 'path';

// Carrega variáveis de ambiente
dotenv.config();

export const env = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // API
  apiPrefix: process.env.API_PREFIX || '/api',
  apiVersion: process.env.API_VERSION || 'v1',

  // WhatsApp
  sessionName: process.env.SESSION_NAME || 'default',
  sessionPath: path.resolve(process.env.SESSION_PATH || './sessions'),
  puppeteerHeadless: process.env.PUPPETEER_HEADLESS === 'true',

  // Security
  apiKey: process.env.API_KEY || 'your-secret-api-key',
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '16777216', 10), // 16MB
  uploadPath: path.resolve(process.env.UPLOAD_PATH || './uploads'),

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logPath: path.resolve(process.env.LOG_PATH || './logs'),

  // Computed
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

// Validação de variáveis obrigatórias
const requiredEnvVars = ['PORT'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar] && !env.isDevelopment) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
