import { MessageMedia, Location, Poll } from 'whatsapp-web.js';
import {
  ISendMessageDTO,
  ISendMediaDTO,
  ISendLocationDTO,
  ISendPollDTO,
  IReactToMessageDTO,
  IForwardMessageDTO,
  IDeleteMessageDTO,
  IEditMessageDTO,
  IFetchMessagesDTO,
  ISearchMessagesDTO,
  IMessageResponse,
} from '../models';
import { whatsAppClientService } from './WhatsAppClientService';
import { Validators, Formatters, ApiError } from '../utils';
import { logger } from '../config';

/**
 * Service responsável por operações com mensagens
 */
export class MessageService {
  /**
   * Envia uma mensagem de texto
   */
  async sendMessage(sessionId: string, data: ISendMessageDTO): Promise<IMessageResponse> {
    Validators.validateChatId(data.chatId);

    const client = whatsAppClientService.getClient(sessionId);

    try {
      const message = await client.sendMessage(data.chatId, data.content, data.options);
      logger.info(`Message sent to ${data.chatId} from session ${sessionId}`);
      return Formatters.formatMessage(message);
    } catch (error) {
      logger.error(`Error sending message:`, error);
      throw ApiError.internal(`Failed to send message: ${error}`);
    }
  }

  /**
   * Envia mídia (imagem, vídeo, áudio, documento)
   */
  async sendMedia(sessionId: string, data: ISendMediaDTO): Promise<IMessageResponse> {
    Validators.validateChatId(data.chatId);
    Validators.validateMediaData(data.media);

    const client = whatsAppClientService.getClient(sessionId);

    try {
      const media = new MessageMedia(
        data.media.mimetype,
        data.media.data,
        data.media.filename,
        data.media.filesize
      );

      const message = await client.sendMessage(data.chatId, media, data.options);
      logger.info(`Media sent to ${data.chatId} from session ${sessionId}`);
      return Formatters.formatMessage(message);
    } catch (error) {
      logger.error(`Error sending media:`, error);
      throw ApiError.internal(`Failed to send media: ${error}`);
    }
  }

  /**
   * Envia localização
   */
  async sendLocation(sessionId: string, data: ISendLocationDTO): Promise<IMessageResponse> {
    Validators.validateChatId(data.chatId);
    Validators.validateLocation(data.latitude, data.longitude);

    const client = whatsAppClientService.getClient(sessionId);

    try {
      const location = new Location(data.latitude, data.longitude, {
        name: data.name,
        address: data.address,
      });

      const message = await client.sendMessage(data.chatId, location);
      logger.info(`Location sent to ${data.chatId} from session ${sessionId}`);
      return Formatters.formatMessage(message);
    } catch (error) {
      logger.error(`Error sending location:`, error);
      throw ApiError.internal(`Failed to send location: ${error}`);
    }
  }

  /**
   * Envia enquete (poll)
   */
  async sendPoll(sessionId: string, data: ISendPollDTO): Promise<IMessageResponse> {
    Validators.validateChatId(data.chatId);
    Validators.validatePollOptions(data.options);

    const client = whatsAppClientService.getClient(sessionId);

    try {
      const poll = new Poll(data.question, data.options, {
        allowMultipleAnswers: data.allowMultipleAnswers,
      });

      const message = await client.sendMessage(data.chatId, poll);
      logger.info(`Poll sent to ${data.chatId} from session ${sessionId}`);
      return Formatters.formatMessage(message);
    } catch (error) {
      logger.error(`Error sending poll:`, error);
      throw ApiError.internal(`Failed to send poll: ${error}`);
    }
  }

  /**
   * Reage a uma mensagem
   */
  async reactToMessage(sessionId: string, data: IReactToMessageDTO): Promise<void> {
    Validators.validateChatId(data.chatId);

    const client = whatsAppClientService.getClient(sessionId);

    try {
      const chat = await client.getChatById(data.chatId);
      const messages = await chat.fetchMessages({ limit: 100 });
      const message = messages.find((m) => m.id._serialized === data.messageId);

      if (!message) {
        throw ApiError.notFound('Message not found', 'MESSAGE_NOT_FOUND' as any);
      }

      await message.react(data.emoji);
      logger.info(`Reacted to message ${data.messageId} in ${data.chatId}`);
    } catch (error) {
      logger.error(`Error reacting to message:`, error);
      throw ApiError.internal(`Failed to react to message: ${error}`);
    }
  }

  /**
   * Encaminha uma mensagem
   */
  async forwardMessage(sessionId: string, data: IForwardMessageDTO): Promise<IMessageResponse> {
    Validators.validateChatId(data.sourceChatId);
    Validators.validateChatId(data.targetChatId);

    const client = whatsAppClientService.getClient(sessionId);

    try {
      const sourceChat = await client.getChatById(data.sourceChatId);
      const messages = await sourceChat.fetchMessages({ limit: 100 });
      const message = messages.find((m) => m.id._serialized === data.messageId);

      if (!message) {
        throw ApiError.notFound('Message not found', 'MESSAGE_NOT_FOUND' as any);
      }

      const targetChat = await client.getChatById(data.targetChatId);
      const forwardedMessage = await message.forward(targetChat);

      logger.info(`Message forwarded from ${data.sourceChatId} to ${data.targetChatId}`);
      return Formatters.formatMessage(forwardedMessage);
    } catch (error) {
      logger.error(`Error forwarding message:`, error);
      throw ApiError.internal(`Failed to forward message: ${error}`);
    }
  }

  /**
   * Deleta uma mensagem
   */
  async deleteMessage(sessionId: string, data: IDeleteMessageDTO): Promise<void> {
    Validators.validateChatId(data.chatId);

    const client = whatsAppClientService.getClient(sessionId);

    try {
      const chat = await client.getChatById(data.chatId);
      const messages = await chat.fetchMessages({ limit: 100 });
      const message = messages.find((m) => m.id._serialized === data.messageId);

      if (!message) {
        throw ApiError.notFound('Message not found', 'MESSAGE_NOT_FOUND' as any);
      }

      await message.delete(data.deleteForEveryone);
      logger.info(`Message ${data.messageId} deleted from ${data.chatId}`);
    } catch (error) {
      logger.error(`Error deleting message:`, error);
      throw ApiError.internal(`Failed to delete message: ${error}`);
    }
  }

  /**
   * Edita uma mensagem
   */
  async editMessage(sessionId: string, data: IEditMessageDTO): Promise<IMessageResponse> {
    Validators.validateChatId(data.chatId);

    const client = whatsAppClientService.getClient(sessionId);

    try {
      const chat = await client.getChatById(data.chatId);
      const messages = await chat.fetchMessages({ limit: 100 });
      const message = messages.find((m) => m.id._serialized === data.messageId);

      if (!message) {
        throw ApiError.notFound('Message not found', 'MESSAGE_NOT_FOUND' as any);
      }

      const editedMessage = await message.edit(data.newContent);
      logger.info(`Message ${data.messageId} edited in ${data.chatId}`);
      return Formatters.formatMessage(editedMessage);
    } catch (error) {
      logger.error(`Error editing message:`, error);
      throw ApiError.internal(`Failed to edit message: ${error}`);
    }
  }

  /**
   * Busca mensagens de um chat
   */
  async fetchMessages(sessionId: string, data: IFetchMessagesDTO): Promise<IMessageResponse[]> {
    Validators.validateChatId(data.chatId);

    const client = whatsAppClientService.getClient(sessionId);

    try {
      const chat = await client.getChatById(data.chatId);
      const messages = await chat.fetchMessages(data.searchOptions || { limit: data.limit || 50 });

      logger.info(`Fetched ${messages.length} messages from ${data.chatId}`);
      return messages.map((m) => Formatters.formatMessage(m));
    } catch (error) {
      logger.error(`Error fetching messages:`, error);
      throw ApiError.internal(`Failed to fetch messages: ${error}`);
    }
  }

  /**
   * Busca mensagens por query
   */
  async searchMessages(sessionId: string, data: ISearchMessagesDTO): Promise<IMessageResponse[]> {
    const client = whatsAppClientService.getClient(sessionId);

    try {
      const messages = await client.searchMessages(data.query, {
        chatId: data.chatId,
        limit: data.limit || 50,
      });

      logger.info(`Found ${messages.length} messages for query "${data.query}"`);
      return messages.map((m) => Formatters.formatMessage(m));
    } catch (error) {
      logger.error(`Error searching messages:`, error);
      throw ApiError.internal(`Failed to search messages: ${error}`);
    }
  }

  /**
   * Baixa mídia de uma mensagem
   */
  async downloadMedia(sessionId: string, chatId: string, messageId: string): Promise<any> {
    Validators.validateChatId(chatId);

    const client = whatsAppClientService.getClient(sessionId);

    try {
      const chat = await client.getChatById(chatId);
      const messages = await chat.fetchMessages({ limit: 100 });
      const message = messages.find((m) => m.id._serialized === messageId);

      if (!message) {
        throw ApiError.notFound('Message not found', 'MESSAGE_NOT_FOUND' as any);
      }

      if (!message.hasMedia) {
        throw ApiError.badRequest('Message does not have media', 'NO_MEDIA' as any);
      }

      const media = await message.downloadMedia();
      logger.info(`Media downloaded from message ${messageId}`);
      return media;
    } catch (error) {
      logger.error(`Error downloading media:`, error);
      throw ApiError.internal(`Failed to download media: ${error}`);
    }
  }
}

export const messageService = new MessageService();
