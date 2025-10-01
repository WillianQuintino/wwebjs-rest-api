import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'express-async-errors';

import { env, logger, morganStream } from './config';
import { errorHandler } from './middlewares';
import routes from './routes';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
    this.errorHandling();
  }

  private middlewares(): void {
    // Security
    this.app.use(helmet());

    // CORS
    this.app.use(cors({
      origin: env.allowedOrigins,
      credentials: true,
    }));

    // Body parsing
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Logging
    if (env.isDevelopment) {
      this.app.use(morgan('dev', { stream: morganStream }));
    } else {
      this.app.use(morgan('combined', { stream: morganStream }));
    }

    // Request ID
    this.app.use((req, _res, next) => {
      req.id = Math.random().toString(36).substring(7);
      next();
    });
  }

  private routes(): void {
    // API routes
    this.app.use(`${env.apiPrefix}/${env.apiVersion}`, routes);

    // Root
    this.app.get('/', (_req, res) => {
      res.json({
        name: 'WhatsApp Web.js API',
        version: '1.0.0',
        status: 'running',
        documentation: '/api/v1/health',
      });
    });

    // 404 handler
    this.app.use((_req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        timestamp: new Date(),
      });
    });
  }

  private errorHandling(): void {
    this.app.use(errorHandler);
  }
}

export default new App().app;
