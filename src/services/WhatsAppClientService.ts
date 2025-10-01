import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import { EventEmitter } from 'events';
import { IWhatsAppClient, ClientStatus, IClientInfo } from '../models';
import { sessionRepository } from '../repositories';
import { whatsappConfig, sessionConfig } from '../config';
import { ApiError } from '../utils';
import { logger } from '../config';

/**
 * Service responsável por gerenciar clientes WhatsApp
 * Implementa Singleton para garantir uma única instância
 */
export class WhatsAppClientService extends EventEmitter {
  private static instance: WhatsAppClientService;

  private constructor() {
    super();
  }

  static getInstance(): WhatsAppClientService {
    if (!WhatsAppClientService.instance) {
      WhatsAppClientService.instance = new WhatsAppClientService();
    }
    return WhatsAppClientService.instance;
  }

  /**
   * Inicializa um novo cliente WhatsApp
   */
  async initializeClient(sessionId: string): Promise<IWhatsAppClient> {
    // Verifica se já existe
    if (sessionRepository.exists(sessionId)) {
      throw ApiError.badRequest(
        `Session ${sessionId} already exists`,
        'CLIENT_ALREADY_EXISTS' as any
      );
    }

    // Cria o cliente
    const client = new Client({
      ...whatsappConfig,
      authStrategy: new LocalAuth({
        clientId: sessionId,
        dataPath: sessionConfig.sessionPath,
      }),
    });

    // Cria a sessão
    const session: IWhatsAppClient = {
      sessionId,
      client,
      isReady: false,
      status: ClientStatus.INITIALIZING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Salva no repositório
    sessionRepository.save(session);

    // Configura event listeners
    this.setupClientEvents(sessionId, client);

    // Inicializa o cliente
    try {
      await client.initialize();
      logger.info(`Client ${sessionId} initialized`);
    } catch (error) {
      sessionRepository.delete(sessionId);
      logger.error(`Failed to initialize client ${sessionId}:`, error);
      throw ApiError.internal(`Failed to initialize client: ${error}`);
    }

    return session;
  }

  /**
   * Configura os event listeners do cliente
   */
  private setupClientEvents(sessionId: string, client: Client): void {
    // QR Code gerado
    client.on('qr', async (qr) => {
      try {
        const qrCodeDataURL = await qrcode.toDataURL(qr);
        sessionRepository.updateQrCode(sessionId, qrCodeDataURL, qr);
        sessionRepository.updateStatus(sessionId, ClientStatus.QR_CODE);

        this.emit('qr', { sessionId, qr: qrCodeDataURL });
        logger.info(`QR Code generated for session ${sessionId}`);
      } catch (error) {
        logger.error(`Error generating QR code for ${sessionId}:`, error);
      }
    });

    // Cliente autenticado
    client.on('authenticated', () => {
      sessionRepository.updateStatus(sessionId, ClientStatus.AUTHENTICATING);
      this.emit('authenticated', { sessionId });
      logger.info(`Client ${sessionId} authenticated`);
    });

    // Falha na autenticação
    client.on('auth_failure', (msg) => {
      sessionRepository.updateStatus(sessionId, ClientStatus.ERROR);
      this.emit('auth_failure', { sessionId, message: msg });
      logger.error(`Authentication failed for ${sessionId}:`, msg);
    });

    // Cliente pronto
    client.on('ready', () => {
      sessionRepository.setReady(sessionId);
      this.emit('ready', { sessionId });
      logger.info(`Client ${sessionId} is ready`);
    });

    // Cliente desconectado
    client.on('disconnected', (reason) => {
      sessionRepository.updateStatus(sessionId, ClientStatus.DISCONNECTED);
      this.emit('disconnected', { sessionId, reason });
      logger.warn(`Client ${sessionId} disconnected:`, reason);
    });

    // Mensagem recebida
    client.on('message', (message) => {
      this.emit('message', { sessionId, message });
    });

    // Outras eventos úteis
    client.on('message_create', (message) => {
      this.emit('message_create', { sessionId, message });
    });

    client.on('message_ack', (message, ack) => {
      this.emit('message_ack', { sessionId, message, ack });
    });
  }

  /**
   * Obtém um cliente por sessionId
   */
  getClient(sessionId: string): Client {
    const session = sessionRepository.findById(sessionId);
    if (!session) {
      throw ApiError.clientNotFound(sessionId);
    }

    if (!session.isReady) {
      throw ApiError.clientNotReady(sessionId);
    }

    return session.client;
  }

  /**
   * Obtém informações de um cliente
   */
  getClientInfo(sessionId: string): IClientInfo {
    const session = sessionRepository.findById(sessionId);
    if (!session) {
      throw ApiError.clientNotFound(sessionId);
    }

    const info: IClientInfo = {
      sessionId: session.sessionId,
      status: session.status,
      isReady: session.isReady,
      qrCode: session.qrCode,
    };

    // Se o cliente está pronto, busca informações adicionais
    if (session.isReady && session.client) {
      const clientInfo = session.client.info;
      if (clientInfo) {
        info.phoneNumber = clientInfo.wid.user;
        info.platform = clientInfo.platform;
        info.pushname = clientInfo.pushname;
      }
    }

    return info;
  }

  /**
   * Lista todas as sessões
   */
  getAllSessions(): IClientInfo[] {
    return sessionRepository.findAll().map((session) => ({
      sessionId: session.sessionId,
      status: session.status,
      isReady: session.isReady,
    }));
  }

  /**
   * Desconecta e remove um cliente
   */
  async destroyClient(sessionId: string): Promise<void> {
    const session = sessionRepository.findById(sessionId);
    if (!session) {
      throw ApiError.clientNotFound(sessionId);
    }

    try {
      await session.client.destroy();
      sessionRepository.delete(sessionId);
      this.emit('destroyed', { sessionId });
      logger.info(`Client ${sessionId} destroyed`);
    } catch (error) {
      logger.error(`Error destroying client ${sessionId}:`, error);
      throw ApiError.internal(`Failed to destroy client: ${error}`);
    }
  }

  /**
   * Faz logout de um cliente
   */
  async logoutClient(sessionId: string): Promise<void> {
    const client = this.getClient(sessionId);

    try {
      await client.logout();
      sessionRepository.updateStatus(sessionId, ClientStatus.DISCONNECTED);
      this.emit('logout', { sessionId });
      logger.info(`Client ${sessionId} logged out`);
    } catch (error) {
      logger.error(`Error logging out client ${sessionId}:`, error);
      throw ApiError.internal(`Failed to logout: ${error}`);
    }
  }

  /**
   * Obtém o estado atual do cliente
   */
  async getState(sessionId: string): Promise<string> {
    const client = this.getClient(sessionId);
    const state = await client.getState();
    return state;
  }

  /**
   * Obtém o status da bateria
   */
  async getBatteryStatus(sessionId: string) {
    const client = this.getClient(sessionId);
    const info = client.info;
    return await info.getBatteryStatus();
  }

  /**
   * Limpa sessões desconectadas antigas
   */
  cleanupOldSessions(): number {
    return sessionRepository.cleanupDisconnected(3600000); // 1 hora
  }
}

// Export singleton instance
export const whatsAppClientService = WhatsAppClientService.getInstance();
