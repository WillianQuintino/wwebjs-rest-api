/**
 * Unit Tests - SessionRepository
 * Tests for session storage and retrieval
 */

import { SessionRepository } from '@repositories/SessionRepository';
import { ISession, SessionStatus } from '@models/ISession';

describe('SessionRepository', () => {
  let repository: SessionRepository;
  const mockSession: ISession = {
    sessionId: 'test-session',
    status: SessionStatus.INITIALIZING,
    client: null,
    qrCode: null,
    isReady: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    repository = SessionRepository.getInstance();
    // Clear all sessions before each test
    const allSessions = repository.findAll();
    allSessions.forEach(session => {
      repository.delete(session.sessionId);
    });
  });

  describe('getInstance', () => {
    it('should return the same instance (Singleton)', () => {
      const instance1 = SessionRepository.getInstance();
      const instance2 = SessionRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('save', () => {
    it('should save a new session', () => {
      repository.save(mockSession);
      const saved = repository.findById('test-session');
      expect(saved).toBeDefined();
      expect(saved?.sessionId).toBe('test-session');
    });

    it('should update existing session', () => {
      repository.save(mockSession);
      const updated = { ...mockSession, status: SessionStatus.READY };
      repository.save(updated);

      const saved = repository.findById('test-session');
      expect(saved?.status).toBe(SessionStatus.READY);
    });
  });

  describe('findById', () => {
    it('should find session by id', () => {
      repository.save(mockSession);
      const found = repository.findById('test-session');
      expect(found).toBeDefined();
      expect(found?.sessionId).toBe('test-session');
    });

    it('should return undefined for non-existent session', () => {
      const found = repository.findById('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('should return all sessions', () => {
      repository.save(mockSession);
      repository.save({ ...mockSession, sessionId: 'session-2' });

      const all = repository.findAll();
      expect(all.length).toBe(2);
    });

    it('should return empty array when no sessions', () => {
      const all = repository.findAll();
      expect(all).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete session', () => {
      repository.save(mockSession);
      repository.delete('test-session');

      const found = repository.findById('test-session');
      expect(found).toBeUndefined();
    });

    it('should not throw when deleting non-existent session', () => {
      expect(() => repository.delete('non-existent')).not.toThrow();
    });
  });

  describe('exists', () => {
    it('should return true for existing session', () => {
      repository.save(mockSession);
      expect(repository.exists('test-session')).toBe(true);
    });

    it('should return false for non-existent session', () => {
      expect(repository.exists('non-existent')).toBe(false);
    });
  });
});
