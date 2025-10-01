import { ErrorCode } from '../models';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';

    // Mantém o stack trace correto
    Error.captureStackTrace(this, this.constructor);
  }

  // Factory methods para erros comuns
  static badRequest(message: string, code: ErrorCode = ErrorCode.VALIDATION_ERROR, details?: any) {
    return new ApiError(message, 400, code, details);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new ApiError(message, 401, ErrorCode.UNAUTHORIZED);
  }

  static forbidden(message: string = 'Forbidden') {
    return new ApiError(message, 403, ErrorCode.FORBIDDEN);
  }

  static notFound(message: string, code: ErrorCode) {
    return new ApiError(message, 404, code);
  }

  static internal(message: string = 'Internal Server Error', details?: any) {
    return new ApiError(message, 500, ErrorCode.INTERNAL_ERROR, details);
  }

  static serviceUnavailable(message: string = 'Service Unavailable') {
    return new ApiError(message, 503, ErrorCode.SERVICE_UNAVAILABLE);
  }

  // Erros específicos do WhatsApp
  static clientNotFound(sessionId: string) {
    return new ApiError(
      `Client not found for session: ${sessionId}`,
      404,
      ErrorCode.CLIENT_NOT_FOUND
    );
  }

  static clientNotReady(sessionId: string) {
    return new ApiError(
      `Client not ready for session: ${sessionId}`,
      503,
      ErrorCode.CLIENT_NOT_READY
    );
  }

  static chatNotFound(chatId: string) {
    return new ApiError(
      `Chat not found: ${chatId}`,
      404,
      ErrorCode.CHAT_NOT_FOUND
    );
  }

  static contactNotFound(contactId: string) {
    return new ApiError(
      `Contact not found: ${contactId}`,
      404,
      ErrorCode.CONTACT_NOT_FOUND
    );
  }

  static groupNotFound(groupId: string) {
    return new ApiError(
      `Group not found: ${groupId}`,
      404,
      ErrorCode.GROUP_NOT_FOUND
    );
  }

  static notGroupAdmin() {
    return new ApiError(
      'You are not a group admin',
      403,
      ErrorCode.NOT_GROUP_ADMIN
    );
  }
}
