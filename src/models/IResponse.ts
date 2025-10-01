export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: IApiError;
  timestamp: Date;
}

export interface IApiError {
  code: string;
  message: string;
  details?: any;
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export enum ErrorCode {
  // Client Errors
  CLIENT_NOT_FOUND = 'CLIENT_NOT_FOUND',
  CLIENT_NOT_READY = 'CLIENT_NOT_READY',
  CLIENT_ALREADY_EXISTS = 'CLIENT_ALREADY_EXISTS',

  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_CHAT_ID = 'INVALID_CHAT_ID',
  INVALID_PHONE_NUMBER = 'INVALID_PHONE_NUMBER',

  // WhatsApp Errors
  MESSAGE_SEND_FAILED = 'MESSAGE_SEND_FAILED',
  MEDIA_UPLOAD_FAILED = 'MEDIA_UPLOAD_FAILED',
  CHAT_NOT_FOUND = 'CHAT_NOT_FOUND',
  CONTACT_NOT_FOUND = 'CONTACT_NOT_FOUND',
  GROUP_NOT_FOUND = 'GROUP_NOT_FOUND',

  // Permission Errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_GROUP_ADMIN = 'NOT_GROUP_ADMIN',

  // Server Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}
