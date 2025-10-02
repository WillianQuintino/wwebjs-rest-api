import { Message, Chat, Contact, GroupChat } from 'whatsapp-web.js';
import {
  IMessageResponse,
  IChatResponse,
  IContactResponse,
  IGroupChatResponse,
  IParticipant,
} from '../models';

export class Formatters {
  /**
   * Formata mensagem do WhatsApp para resposta da API
   */
  static formatMessage(message: Message): IMessageResponse {
    return {
      id: message.id._serialized,
      body: message.body,
      from: message.from,
      to: message.to,
      timestamp: message.timestamp,
      type: message.type,
      hasMedia: message.hasMedia,
      fromMe: message.fromMe,
      isForwarded: message.isForwarded,
      ack: message.ack,
    };
  }

  /**
   * Formata chat do WhatsApp para resposta da API
   */
  static async formatChat(chat: Chat): Promise<IChatResponse> {
    const lastMessage = chat.lastMessage;

    return {
      id: chat.id._serialized,
      name: chat.name,
      isGroup: chat.isGroup,
      isReadOnly: chat.isReadOnly,
      unreadCount: chat.unreadCount,
      timestamp: chat.timestamp,
      archived: chat.archived,
      pinned: chat.pinned,
      isMuted: chat.isMuted,
      muteExpiration: chat.muteExpiration,
      lastMessage: lastMessage
        ? {
            id: lastMessage.id._serialized,
            body: lastMessage.body,
            timestamp: lastMessage.timestamp,
            fromMe: lastMessage.fromMe,
          }
        : undefined,
    };
  }

  /**
   * Formata grupo do WhatsApp para resposta da API
   */
  static async formatGroupChat(groupChat: GroupChat): Promise<IGroupChatResponse> {
    const baseChat = await this.formatChat(groupChat);

    const participants: IParticipant[] = groupChat.participants.map((p) => ({
      id: p.id._serialized,
      isAdmin: p.isAdmin,
      isSuperAdmin: p.isSuperAdmin,
    }));

    return {
      ...baseChat,
      participants,
      owner: groupChat.owner._serialized,
      createdAt: groupChat.createdAt instanceof Date ? groupChat.createdAt.getTime() : groupChat.createdAt,
      description: groupChat.description,
    };
  }

  /**
   * Formata contato do WhatsApp para resposta da API
   */
  static formatContact(contact: Contact): IContactResponse {
    return {
      id: contact.id._serialized,
      name: contact.name,
      pushname: contact.pushname,
      shortName: contact.shortName,
      number: contact.number,
      isBusiness: contact.isBusiness,
      isEnterprise: contact.isEnterprise,
      isGroup: contact.isGroup,
      isMe: contact.isMe,
      isMyContact: contact.isMyContact,
      isUser: contact.isUser,
      isWAContact: contact.isWAContact,
      isBlocked: contact.isBlocked,
    };
  }

  /**
   * Converte base64 para Buffer
   */
  static base64ToBuffer(base64: string): Buffer {
    // Remove o prefixo data:image/png;base64, se existir
    const base64Data = base64.replace(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/, '');
    return Buffer.from(base64Data, 'base64');
  }

  /**
   * Extrai mimetype de string base64 com prefixo
   */
  static extractMimetype(base64: string): string | null {
    const match = base64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    return match ? match[1] : null;
  }

  /**
   * Formata número de telefone removendo caracteres especiais
   */
  static cleanPhoneNumber(phoneNumber: string): string {
    return phoneNumber.replace(/\D/g, '');
  }

  /**
   * Formata duração em ms para formato legível
   */
  static formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * Formata tamanho de arquivo
   */
  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}
