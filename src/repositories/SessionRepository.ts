import { IWhatsAppClient, ClientStatus } from '../models';
import { ApiError } from '../utils';

/**
 * Repository para gerenciar sessões de clientes WhatsApp
 * Implementa o padrão Repository para abstrair o armazenamento
 */
export class SessionRepository {
  private sessions: Map<string, IWhatsAppClient> = new Map();

  /**
   * Cria ou atualiza uma sessão
   */
  save(session: IWhatsAppClient): void {
    this.sessions.set(session.sessionId, {
      ...session,
      updatedAt: new Date(),
    });
  }

  /**
   * Busca uma sessão por ID
   */
  findById(sessionId: string): IWhatsAppClient | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Busca todas as sessões
   */
  findAll(): IWhatsAppClient[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Busca sessões por status
   */
  findByStatus(status: ClientStatus): IWhatsAppClient[] {
    return this.findAll().filter((session) => session.status === status);
  }

  /**
   * Verifica se uma sessão existe
   */
  exists(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  /**
   * Remove uma sessão
   */
  delete(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Remove todas as sessões
   */
  deleteAll(): void {
    this.sessions.clear();
  }

  /**
   * Conta o número de sessões
   */
  count(): number {
    return this.sessions.size;
  }

  /**
   * Conta sessões por status
   */
  countByStatus(status: ClientStatus): number {
    return this.findByStatus(status).length;
  }

  /**
   * Atualiza o status de uma sessão
   */
  updateStatus(sessionId: string, status: ClientStatus): void {
    const session = this.findById(sessionId);
    if (!session) {
      throw ApiError.clientNotFound(sessionId);
    }

    session.status = status;
    session.updatedAt = new Date();
    this.save(session);
  }

  /**
   * Atualiza o QR Code de uma sessão
   */
  updateQrCode(sessionId: string, qrCode: string): void {
    const session = this.findById(sessionId);
    if (!session) {
      throw ApiError.clientNotFound(sessionId);
    }

    session.qrCode = qrCode;
    session.updatedAt = new Date();
    this.save(session);
  }

  /**
   * Marca uma sessão como pronta
   */
  setReady(sessionId: string): void {
    const session = this.findById(sessionId);
    if (!session) {
      throw ApiError.clientNotFound(sessionId);
    }

    session.isReady = true;
    session.status = ClientStatus.READY;
    session.qrCode = undefined;
    session.updatedAt = new Date();
    this.save(session);
  }

  /**
   * Remove sessões desconectadas há mais de X tempo
   */
  cleanupDisconnected(maxAgeMs: number = 3600000): number {
    // 1 hora
    const now = Date.now();
    const toDelete: string[] = [];

    this.sessions.forEach((session, sessionId) => {
      if (
        session.status === ClientStatus.DISCONNECTED &&
        now - session.updatedAt.getTime() > maxAgeMs
      ) {
        toDelete.push(sessionId);
      }
    });

    toDelete.forEach((sessionId) => this.delete(sessionId));
    return toDelete.length;
  }
}

// Singleton instance
export const sessionRepository = new SessionRepository();
