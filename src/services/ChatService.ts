import { whatsAppClientService } from './WhatsAppClientService';
import { Validators, Formatters } from '../utils';
import { logger } from '../config';
import { IChatResponse, IArchiveChatDTO, IPinChatDTO, IMuteChatDTO } from '../models';

export class ChatService {
  async getAllChats(sessionId: string): Promise<IChatResponse[]> {
    const client = whatsAppClientService.getClient(sessionId);
    const chats = await client.getChats();
    return Promise.all(chats.map((chat) => Formatters.formatChat(chat)));
  }

  async getChatById(sessionId: string, chatId: string): Promise<IChatResponse> {
    Validators.validateChatId(chatId);
    const client = whatsAppClientService.getClient(sessionId);
    const chat = await client.getChatById(chatId);
    return Formatters.formatChat(chat);
  }

  async archiveChat(sessionId: string, data: IArchiveChatDTO): Promise<void> {
    Validators.validateChatId(data.chatId);
    const client = whatsAppClientService.getClient(sessionId);
    const chat = await client.getChatById(data.chatId);
    await (data.archive ? chat.archive() : chat.unarchive());
    logger.info(`Chat ${data.chatId} ${data.archive ? 'archived' : 'unarchived'}`);
  }

  async pinChat(sessionId: string, data: IPinChatDTO): Promise<void> {
    Validators.validateChatId(data.chatId);
    const client = whatsAppClientService.getClient(sessionId);
    const chat = await client.getChatById(data.chatId);
    await (data.pin ? chat.pin() : chat.unpin());
    logger.info(`Chat ${data.chatId} ${data.pin ? 'pinned' : 'unpinned'}`);
  }

  async muteChat(sessionId: string, data: IMuteChatDTO): Promise<void> {
    Validators.validateChatId(data.chatId);
    const client = whatsAppClientService.getClient(sessionId);
    const chat = await client.getChatById(data.chatId);

    if (data.mute && data.duration) {
      const unmuteDate = new Date(Date.now() + data.duration * 1000);
      await chat.mute(unmuteDate);
    } else if (!data.mute) {
      await chat.unmute();
    }

    logger.info(`Chat ${data.chatId} ${data.mute ? 'muted' : 'unmuted'}`);
  }

  async markUnread(sessionId: string, chatId: string): Promise<void> {
    Validators.validateChatId(chatId);
    const client = whatsAppClientService.getClient(sessionId);
    const chat = await client.getChatById(chatId);
    await chat.markUnread();
    logger.info(`Chat ${chatId} marked as unread`);
  }

  async sendSeen(sessionId: string, chatId: string): Promise<void> {
    Validators.validateChatId(chatId);
    const client = whatsAppClientService.getClient(sessionId);
    const chat = await client.getChatById(chatId);
    await chat.sendSeen();
    logger.info(`Seen sent to chat ${chatId}`);
  }

  async sendTyping(sessionId: string, chatId: string): Promise<void> {
    Validators.validateChatId(chatId);
    const client = whatsAppClientService.getClient(sessionId);
    const chat = await client.getChatById(chatId);
    await chat.sendStateTyping();
    logger.info(`Typing state sent to chat ${chatId}`);
  }

  async sendRecording(sessionId: string, chatId: string): Promise<void> {
    Validators.validateChatId(chatId);
    const client = whatsAppClientService.getClient(sessionId);
    const chat = await client.getChatById(chatId);
    await chat.sendStateRecording();
    logger.info(`Recording state sent to chat ${chatId}`);
  }

  async clearMessages(sessionId: string, chatId: string): Promise<void> {
    Validators.validateChatId(chatId);
    const client = whatsAppClientService.getClient(sessionId);
    const chat = await client.getChatById(chatId);
    await chat.clearMessages();
    logger.info(`Messages cleared from chat ${chatId}`);
  }

  async deleteChat(sessionId: string, chatId: string): Promise<void> {
    Validators.validateChatId(chatId);
    const client = whatsAppClientService.getClient(sessionId);
    const chat = await client.getChatById(chatId);
    await chat.delete();
    logger.info(`Chat ${chatId} deleted`);
  }
}

export const chatService = new ChatService();
