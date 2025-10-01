/**
 * Unit Tests - ApiError
 * Tests for custom error handling
 */

import { ApiError } from '@utils/ApiError';

describe('ApiError', () => {
  describe('constructor', () => {
    it('should create error with all properties', () => {
      const error = new ApiError(400, 'BAD_REQUEST', 'Invalid input');

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.message).toBe('Invalid input');
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('clientNotFound', () => {
    it('should create CLIENT_NOT_FOUND error', () => {
      const error = ApiError.clientNotFound('test-session');

      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('CLIENT_NOT_FOUND');
      expect(error.message).toContain('test-session');
    });
  });

  describe('clientNotReady', () => {
    it('should create CLIENT_NOT_READY error', () => {
      const error = ApiError.clientNotReady('test-session');

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('CLIENT_NOT_READY');
      expect(error.message).toContain('test-session');
    });
  });

  describe('clientAlreadyExists', () => {
    it('should create CLIENT_ALREADY_EXISTS error', () => {
      const error = ApiError.clientAlreadyExists('test-session');

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('CLIENT_ALREADY_EXISTS');
      expect(error.message).toContain('test-session');
    });
  });

  describe('badRequest', () => {
    it('should create BAD_REQUEST error', () => {
      const error = ApiError.badRequest('Missing field');

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.message).toBe('Missing field');
    });
  });

  describe('notFound', () => {
    it('should create NOT_FOUND error', () => {
      const error = ApiError.notFound('Resource');

      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toContain('Resource');
    });
  });

  describe('internalError', () => {
    it('should create INTERNAL_ERROR error', () => {
      const error = ApiError.internalError('Something went wrong');

      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.message).toBe('Something went wrong');
    });
  });

  describe('qrCodeNotAvailable', () => {
    it('should create QR_CODE_NOT_AVAILABLE error', () => {
      const error = ApiError.qrCodeNotAvailable();

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('QR_CODE_NOT_AVAILABLE');
      expect(error.message).toContain('QR code');
    });
  });

  describe('invalidChatId', () => {
    it('should create INVALID_CHAT_ID error', () => {
      const error = ApiError.invalidChatId('invalid-id');

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('INVALID_CHAT_ID');
      expect(error.message).toContain('invalid-id');
    });
  });
});
