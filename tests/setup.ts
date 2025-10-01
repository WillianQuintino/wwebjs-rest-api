/**
 * Test Setup - Configuração global para todos os testes
 */

// Aumentar timeout global para testes que envolvem WhatsApp
jest.setTimeout(30000);

// Mock do logger para não poluir output dos testes
jest.mock('../src/config/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
  morganStream: {
    write: jest.fn(),
  },
}));

// Limpar todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});
