import { ErrorCode } from '../models';
import { ApiError } from './ApiError';

export class Validators {
  /**
   * Valida se o chatId está no formato correto
   * Formatos aceitos:
   * - Número individual: 5511999999999@c.us
   * - Grupo: 123456789@g.us
   */
  static validateChatId(chatId: string): void {
    const chatIdRegex = /^(\d+)@(c\.us|g\.us)$/;
    if (!chatIdRegex.test(chatId)) {
      throw ApiError.badRequest(
        'Invalid chat ID format. Expected: number@c.us or number@g.us',
        ErrorCode.INVALID_CHAT_ID
      );
    }
  }

  /**
   * Valida se o número de telefone está no formato correto
   * Formato: código do país + DDD + número (sem espaços, hífens ou parênteses)
   * Exemplo: 5511999999999
   */
  static validatePhoneNumber(phoneNumber: string): void {
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw ApiError.badRequest(
        'Invalid phone number format. Expected: country code + area code + number (10-15 digits)',
        ErrorCode.INVALID_PHONE_NUMBER
      );
    }
  }

  /**
   * Valida se o sessionId é válido
   */
  static validateSessionId(sessionId: string): void {
    if (!sessionId || sessionId.trim().length === 0) {
      throw ApiError.badRequest('Session ID is required', ErrorCode.VALIDATION_ERROR);
    }

    const sessionIdRegex = /^[a-zA-Z0-9_-]+$/;
    if (!sessionIdRegex.test(sessionId)) {
      throw ApiError.badRequest(
        'Invalid session ID format. Only alphanumeric characters, hyphens and underscores are allowed',
        ErrorCode.VALIDATION_ERROR
      );
    }
  }

  /**
   * Valida se o arquivo de mídia é válido
   */
  static validateMediaData(media: { mimetype: string; data: string; filename?: string }): void {
    if (!media.mimetype || !media.data) {
      throw ApiError.badRequest(
        'Media mimetype and data are required',
        ErrorCode.VALIDATION_ERROR
      );
    }

    // Valida se o data está em base64
    const base64Regex = /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/;
    if (!base64Regex.test(media.data) && !this.isBase64(media.data)) {
      throw ApiError.badRequest(
        'Invalid media data format. Expected base64 string',
        ErrorCode.VALIDATION_ERROR
      );
    }
  }

  /**
   * Valida coordenadas de localização
   */
  static validateLocation(latitude: number, longitude: number): void {
    if (latitude < -90 || latitude > 90) {
      throw ApiError.badRequest(
        'Invalid latitude. Must be between -90 and 90',
        ErrorCode.VALIDATION_ERROR
      );
    }

    if (longitude < -180 || longitude > 180) {
      throw ApiError.badRequest(
        'Invalid longitude. Must be between -180 and 180',
        ErrorCode.VALIDATION_ERROR
      );
    }
  }

  /**
   * Verifica se uma string está em base64
   */
  private static isBase64(str: string): boolean {
    try {
      return Buffer.from(str, 'base64').toString('base64') === str;
    } catch {
      return false;
    }
  }

  /**
   * Formata número de telefone para o formato do WhatsApp
   */
  static formatPhoneNumber(phoneNumber: string): string {
    // Remove todos os caracteres não numéricos
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Valida
    this.validatePhoneNumber(cleaned);

    return `${cleaned}@c.us`;
  }

  /**
   * Valida array de participantes
   */
  static validateParticipantIds(participantIds: string[]): void {
    if (!Array.isArray(participantIds) || participantIds.length === 0) {
      throw ApiError.badRequest(
        'Participant IDs must be a non-empty array',
        ErrorCode.VALIDATION_ERROR
      );
    }

    participantIds.forEach((id) => this.validateChatId(id));
  }

  /**
   * Valida opções de enquete
   */
  static validatePollOptions(options: string[]): void {
    if (!Array.isArray(options) || options.length < 2) {
      throw ApiError.badRequest(
        'Poll must have at least 2 options',
        ErrorCode.VALIDATION_ERROR
      );
    }

    if (options.length > 12) {
      throw ApiError.badRequest(
        'Poll can have maximum 12 options',
        ErrorCode.VALIDATION_ERROR
      );
    }

    options.forEach((option) => {
      if (!option || option.trim().length === 0) {
        throw ApiError.badRequest(
          'Poll options cannot be empty',
          ErrorCode.VALIDATION_ERROR
        );
      }

      if (option.length > 100) {
        throw ApiError.badRequest(
          'Poll option cannot exceed 100 characters',
          ErrorCode.VALIDATION_ERROR
        );
      }
    });
  }
}
