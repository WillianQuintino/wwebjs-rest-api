import { Response } from 'express';
import { IApiResponse, IPaginatedResponse } from '../models';

export class ApiResponse {
  static success<T>(res: Response, data: T, message?: string, statusCode: number = 200) {
    const response: IApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date(),
    };

    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message?: string) {
    return this.success(res, data, message, 201);
  }

  static error(res: Response, message: string, statusCode: number = 500, code?: string, details?: any) {
    const response: IApiResponse = {
      success: false,
      message,
      error: {
        code: code || 'INTERNAL_ERROR',
        message,
        details,
      },
      timestamp: new Date(),
    };

    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ) {
    const response: IApiResponse<IPaginatedResponse<T>> = {
      success: true,
      data: {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      message,
      timestamp: new Date(),
    };

    return res.status(200).json(response);
  }
}
