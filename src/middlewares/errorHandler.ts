import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { logger } from '../config';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error('Error caught by error handler:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  if (error instanceof ApiError) {
    return ApiResponse.error(
      res,
      error.message,
      error.statusCode,
      error.code,
      error.details
    );
  }

  // Erro não tratado
  return ApiResponse.error(
    res,
    'Internal Server Error',
    500,
    'INTERNAL_ERROR',
    process.env.NODE_ENV === 'development' ? error.stack : undefined
  );
}
