/**
 * Integration Tests - Sessions
 * Tests for session management endpoints
 */

import request from 'supertest';
import { App } from '@config/app';

describe('Session Management', () => {
  let app: any;
  const testSessionId = 'test-session-' + Date.now();
  const baseUrl = '/api/v1/sessions';

  beforeAll(() => {
    const appInstance = new App();
    app = appInstance.getApp();
  });

  describe('POST /sessions/:sessionId/init', () => {
    it('should initialize a new session', async () => {
      const response = await request(app)
        .post(`${baseUrl}/${testSessionId}/init`)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('sessionId', testSessionId);
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('qrEndpoint');
    });

    it('should return error when initializing existing session', async () => {
      const response = await request(app)
        .post(`${baseUrl}/${testSessionId}/init`)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'CLIENT_ALREADY_EXISTS');
    });
  });

  describe('GET /sessions/:sessionId', () => {
    it('should get session information', async () => {
      const response = await request(app)
        .get(`${baseUrl}/${testSessionId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('sessionId', testSessionId);
      expect(response.body.data).toHaveProperty('status');
    });

    it('should return 404 for non-existent session', async () => {
      const response = await request(app)
        .get(`${baseUrl}/non-existent-session`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'CLIENT_NOT_FOUND');
    });
  });

  describe('GET /sessions', () => {
    it('should list all sessions', async () => {
      const response = await request(app)
        .get(baseUrl)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /sessions/:sessionId/qr/image', () => {
    it('should return QR code image when available', async () => {
      const response = await request(app)
        .get(`${baseUrl}/${testSessionId}/qr/image`)
        .expect('Content-Type', /image/);

      // Should return image (200) or not ready yet (400)
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('GET /sessions/:sessionId/qr/ascii', () => {
    it('should return QR code in ASCII format when available', async () => {
      const response = await request(app)
        .get(`${baseUrl}/${testSessionId}/qr/ascii`);

      // Should return ASCII (200) or not ready yet (400)
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('DELETE /sessions/:sessionId', () => {
    it('should destroy session', async () => {
      const response = await request(app)
        .delete(`${baseUrl}/${testSessionId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 when destroying non-existent session', async () => {
      const response = await request(app)
        .delete(`${baseUrl}/${testSessionId}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'CLIENT_NOT_FOUND');
    });
  });
});
