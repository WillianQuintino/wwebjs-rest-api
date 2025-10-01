/**
 * Unit Tests - Validators
 * Tests for utility validators
 */

import { isChatId, isGroupId, isIndividualId, formatChatId } from '@utils/validators';

describe('Validators', () => {
  describe('isChatId', () => {
    it('should validate individual chat ID', () => {
      expect(isChatId('5511999999999@c.us')).toBe(true);
    });

    it('should validate group chat ID', () => {
      expect(isChatId('123456789@g.us')).toBe(true);
    });

    it('should reject invalid chat ID', () => {
      expect(isChatId('invalid')).toBe(false);
      expect(isChatId('5511999999999')).toBe(false);
      expect(isChatId('@c.us')).toBe(false);
    });
  });

  describe('isGroupId', () => {
    it('should validate group ID', () => {
      expect(isGroupId('123456789@g.us')).toBe(true);
    });

    it('should reject individual ID', () => {
      expect(isGroupId('5511999999999@c.us')).toBe(false);
    });

    it('should reject invalid ID', () => {
      expect(isGroupId('invalid')).toBe(false);
    });
  });

  describe('isIndividualId', () => {
    it('should validate individual ID', () => {
      expect(isIndividualId('5511999999999@c.us')).toBe(true);
    });

    it('should reject group ID', () => {
      expect(isIndividualId('123456789@g.us')).toBe(false);
    });

    it('should reject invalid ID', () => {
      expect(isIndividualId('invalid')).toBe(false);
    });
  });

  describe('formatChatId', () => {
    it('should format phone number to individual chat ID', () => {
      expect(formatChatId('5511999999999')).toBe('5511999999999@c.us');
    });

    it('should keep already formatted individual ID', () => {
      expect(formatChatId('5511999999999@c.us')).toBe('5511999999999@c.us');
    });

    it('should keep group ID unchanged', () => {
      expect(formatChatId('123456789@g.us')).toBe('123456789@g.us');
    });
  });
});
